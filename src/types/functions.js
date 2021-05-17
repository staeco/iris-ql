import sql from 'sequelize'
import capitalize from 'capitalize'
import decamelize from 'decamelize'
import isObject from 'is-plain-obj'
import ms from 'pretty-ms'
import moment from 'moment-timezone'
import { force as forceTZ } from '../util/tz'
import { parse } from '../util/getJoinField'
import search from '../util/search'
import { multiline, line, point, polygon, multipolygon } from './'

const wgs84 = 4326

// some operations we don't want to display a percentage after, for example:
// 33% * 100,000 should return 33,000 as a flat integer
// 100,000 / 77% should return 130,000 as a flat integer
const isPercentage = (i) => i.measurement?.type === 'percentage'
const inheritNumeric = ({ retainPercentage }, [infoA, infoB]) => {
  const filter = (i) =>
    (i.type === 'number' || i.type === 'date') &&
    (retainPercentage || !isPercentage(i))
  const primaryTypeA = infoA?.types.find(filter)
  const primaryTypeB = infoB?.types.find(filter)
  return {
    type: primaryTypeA?.type || primaryTypeB?.type,
    measurement: primaryTypeA?.measurement || primaryTypeB?.measurement
  }
}

const numeric = (info) => {
  if (info.value.type === 'numeric') return info.value // already cast as numeric
  const flatTypes = info.types.map((i) => i.type)
  //if (flatTypes.includes('number')) return info.value // already a number
  if (flatTypes.includes('date')) {
    return sql.fn('time_to_ms', info.value)
  }
  return sql.cast(info.value, 'numeric')
}

const getGeoReturnType = (raw) => {
  let o
  try {
    o = JSON.parse(raw)
  } catch (err) {
    return 'geometry'
  }
  if (!isObject(o)) return 'geometry'

  // FeatureCollection
  if (Array.isArray(o.features)) return 'geometry'
  // Feature
  if (o.geometry) return getGeoReturnType(JSON.stringify(o.geometry))
  // Regular types
  if (point.test(o) === true) return 'point'
  if (line.test(o) === true) return 'line'
  if (multiline.test(o) === true) return 'multiline'
  if (polygon.test(o) === true) return 'polygon'
  if (multipolygon.test(o) === true) return 'multipolygon'
  return 'geometry'
}

const getGeometryValue = (raw) => {
  let o
  try {
    o = JSON.parse(raw)
  } catch (err) {
    throw new Error('Not a valid object!')
  }
  if (!isObject(o)) throw new Error('Not a valid object!')
  if (typeof o.type !== 'string') throw new Error('Not a valid GeoJSON object!')

  // FeatureCollection
  if (Array.isArray(o.features)) return sql.fn('from_geojson_collection', raw)

  // Feature
  if (o.geometry) return getGeometryValue(JSON.stringify(o.geometry))

  // Anything else
  return sql.fn('from_geojson', raw)
}

const partsToDB = {
  hourOfDay: 'hour',
  dayOfWeek: 'isodow',
  dayOfMonth: 'day',
  dayOfYear: 'doy',
  week: 'week',
  month: 'month',
  customMonth: 'custom_month',
  quarter: 'quarter',
  customQuarter: 'custom_quarter',
  year: 'year',
  customYear: 'custom_year',
  decade: 'decade'
}
const parts = Object.keys(partsToDB).map((k) => ({
  value: k,
  label: capitalize.words(decamelize(k, { separator: ' ' }))
}))

const truncatesToDB = {
  second: 'second',
  minute: 'minute',
  hour: 'hour',
  day: 'day',
  week: 'week',
  month: 'month',
  quarter: 'quarter',
  customQuarter: 'custom_quarter',
  year: 'year',
  customYear: 'custom_year',
  decade: 'decade'
}
const truncates = Object.keys(truncatesToDB).map((k) => ({
  value: k,
  label: capitalize.words(decamelize(k, { separator: ' ' }))
}))
const categories = {
  arrays: 'Array',
  aggregations: 'Aggregation',
  math: 'Math',
  comparisons: 'Comparison',
  time: 'Date/Time',
  geospatial: 'Geospatial'
}

// Arrays
export const expand = {
  name: 'Expand List',
  notes: 'Expands a list to a set of rows',
  category: categories.arrays,
  signature: [
    {
      name: 'List',
      types: ['array'],
      required: true
    }
  ],
  returns: {
    static: { type: 'any' },
    dynamic: ([listInfo]) =>
      listInfo.types.find((i) => i.type === 'array').items
  },
  execute: ([listInfo]) => sql.fn('unnest', listInfo.value)
}

// Aggregations
export const min = {
  name: 'Minimum',
  notes: 'Aggregates the minimum value of a number',
  category: categories.aggregations,
  signature: [
    {
      name: 'Value',
      types: ['number', 'date'],
      required: true
    }
  ],
  returns: {
    static: { type: 'number' },
    dynamic: inheritNumeric.bind(null, { retainPercentage: true })
  },
  aggregate: true,
  execute: ([f]) => sql.fn('min', numeric(f))
}
export const max = {
  name: 'Maximum',
  notes: 'Aggregates the maximum value of a number',
  category: categories.aggregations,
  signature: [
    {
      name: 'Value',
      types: ['number', 'date'],
      required: true
    }
  ],
  returns: {
    static: { type: 'number' },
    dynamic: inheritNumeric.bind(null, { retainPercentage: true })
  },
  aggregate: true,
  execute: ([f]) => sql.fn('max', numeric(f))
}
export const sum = {
  name: 'Sum',
  notes: 'Aggregates the sum total of a number',
  category: categories.aggregations,
  signature: [
    {
      name: 'Value',
      types: ['number'],
      required: true
    }
  ],
  returns: {
    static: { type: 'number' },
    dynamic: inheritNumeric.bind(null, { retainPercentage: true })
  },
  aggregate: true,
  execute: ([f], opt, qv) => {
    if (!opt.joins) return sql.fn('sum', numeric(f))

    const distincts = []

    const primaryDistinct = search(
      f.raw,
      (k, v) => v?.field && !v.field.startsWith('~')
    )
    const joinDistincts = search(f.raw, (k, v) =>
      v?.field?.startsWith('~')
    )?.map((i) => qv({ field: `~${parse(i.value.field).alias}.id` }))

    if (primaryDistinct) distincts.push(qv({ field: 'id' }))
    if (joinDistincts) distincts.push(...joinDistincts)

    return sql.fn('dist_sum', sql.fn('distinct', ...distincts), numeric(f))
  }
}
export const average = {
  name: 'Average',
  notes: 'Aggregates the average of a number',
  category: categories.aggregations,
  signature: [
    {
      name: 'Value',
      types: ['number'],
      required: true
    }
  ],
  returns: {
    static: { type: 'number' },
    dynamic: inheritNumeric.bind(null, { retainPercentage: true })
  },
  aggregate: true,
  execute: ([f]) => sql.fn('avg', numeric(f))
}
export const median = {
  name: 'Median',
  notes: 'Aggregates the median of a number',
  category: categories.aggregations,
  signature: [
    {
      name: 'Value',
      types: ['number'],
      required: true
    }
  ],
  returns: {
    static: { type: 'number' },
    dynamic: inheritNumeric.bind(null, { retainPercentage: true })
  },
  aggregate: true,
  execute: ([f]) => sql.fn('median', numeric(f))
}
export const count = {
  name: 'Total Count',
  notes: 'Aggregates the total number of rows',
  category: categories.aggregations,
  returns: {
    static: { type: 'number' }
  },
  aggregate: true,
  execute: () => sql.fn('count', sql.literal('*'))
}
export const distinctCount = {
  name: 'Unique Count',
  notes: 'Aggregates the total number of unique values',
  category: categories.aggregations,
  signature: [
    {
      name: 'Field',
      types: 'any',
      required: true
    }
  ],
  returns: {
    static: { type: 'number' }
  },
  aggregate: true,
  execute: ([f]) => sql.fn('count', sql.fn('distinct', f.value))
}

// Math
export const round = {
  name: 'Round',
  notes: 'Rounds a number',
  category: categories.math,
  signature: [
    {
      name: 'Value A',
      types: ['number'],
      required: true
    }
  ],
  returns: {
    static: { type: 'number' },
    dynamic: inheritNumeric.bind(null, { retainPercentage: true })
  },
  execute: ([a]) => sql.fn('round', numeric(a))
}
export const add = {
  name: 'Add',
  notes: 'Applies addition to multiple numbers',
  category: categories.math,
  signature: [
    {
      name: 'Value A',
      types: ['number'],
      required: true
    },
    {
      name: 'Value B',
      types: ['number'],
      required: true
    }
  ],
  returns: {
    static: { type: 'number' },
    dynamic: inheritNumeric.bind(null, { retainPercentage: true })
  },
  execute: ([a, b]) => sql.fn('add', numeric(a), numeric(b))
}
export const subtract = {
  name: 'Subtract',
  notes: 'Applies subtraction to multiple numbers',
  category: categories.math,
  signature: [
    {
      name: 'Value A',
      types: ['number'],
      required: true
    },
    {
      name: 'Value B',
      types: ['number'],
      required: true
    }
  ],
  returns: {
    static: { type: 'number' },
    dynamic: inheritNumeric.bind(null, { retainPercentage: true })
  },
  execute: ([a, b]) => sql.fn('subtract', numeric(a), numeric(b))
}
export const multiply = {
  name: 'Multiply',
  notes: 'Applies multiplication to multiple numbers',
  category: categories.math,
  signature: [
    {
      name: 'Value A',
      types: ['number'],
      required: true
    },
    {
      name: 'Value B',
      types: ['number'],
      required: true
    }
  ],
  returns: {
    static: { type: 'number' },
    dynamic: inheritNumeric.bind(null, { retainPercentage: false })
  },
  execute: ([a, b]) => sql.fn('multiply', numeric(a), numeric(b))
}
export const divide = {
  name: 'Divide',
  notes: 'Applies division to multiple numbers',
  category: categories.math,
  signature: [
    {
      name: 'Value A',
      types: ['number'],
      required: true
    },
    {
      name: 'Value B',
      types: ['number'],
      required: true
    }
  ],
  returns: {
    static: { type: 'number' },
    dynamic: inheritNumeric.bind(null, { retainPercentage: false })
  },
  execute: ([a, b]) => sql.fn('divide', numeric(a), numeric(b))
}
export const percentage = {
  name: 'Percentage',
  notes: 'Returns the percentage of Value A in Value B',
  category: categories.math,
  signature: [
    {
      name: 'Value A',
      types: ['number'],
      required: true
    },
    {
      name: 'Value B',
      types: ['number'],
      required: true
    }
  ],
  returns: {
    static: {
      type: 'number',
      measurement: {
        type: 'percentage',
        value: 'decimal'
      }
    }
  },
  execute: ([a, b]) => sql.fn('divide', numeric(a), numeric(b))
}
export const remainder = {
  name: 'Remainder',
  notes:
    'Applies division to multiple numbers and returns the remainder/modulus',
  category: categories.math,
  signature: [
    {
      name: 'Value A',
      types: ['number'],
      required: true
    },
    {
      name: 'Value B',
      types: ['number'],
      required: true
    }
  ],
  returns: {
    static: { type: 'number' },
    dynamic: inheritNumeric.bind(null, { retainPercentage: false })
  },
  execute: ([a, b]) => sql.fn('modulus', numeric(a), numeric(b))
}

// Comparisons
export const gt = {
  name: 'Greater Than',
  notes: 'Returns true/false if Value A is greater than Value B',
  category: categories.comparisons,
  signature: [
    {
      name: 'Value A',
      types: ['number', 'date'],
      required: true
    },
    {
      name: 'Value B',
      types: ['number', 'date'],
      required: true
    }
  ],
  returns: {
    static: { type: 'boolean' }
  },
  execute: ([a, b]) => sql.fn('gt', numeric(a), numeric(b))
}
export const lt = {
  name: 'Less Than',
  notes: 'Returns true/false if Value A is less than Value B',
  category: categories.comparisons,
  signature: [
    {
      name: 'Value A',
      types: ['number', 'date'],
      required: true
    },
    {
      name: 'Value B',
      types: ['number', 'date'],
      required: true
    }
  ],
  returns: {
    static: { type: 'boolean' }
  },
  execute: ([a, b]) => sql.fn('lt', numeric(a), numeric(b))
}
export const gte = {
  name: 'Greater Than or Equal',
  notes: 'Returns true/false if Value A is greater than Value B or equal',
  category: categories.comparisons,
  signature: [
    {
      name: 'Value A',
      types: ['number', 'date'],
      required: true
    },
    {
      name: 'Value B',
      types: ['number', 'date'],
      required: true
    }
  ],
  returns: {
    static: { type: 'boolean' }
  },
  execute: ([a, b]) => sql.fn('gte', numeric(a), numeric(b))
}
export const lte = {
  name: 'Less Than or Equal',
  notes: 'Returns true/false if Value A is less than Value B or equal',
  category: categories.comparisons,
  signature: [
    {
      name: 'Value A',
      types: ['number', 'date'],
      required: true
    },
    {
      name: 'Value B',
      types: ['number', 'date'],
      required: true
    }
  ],
  returns: {
    static: { type: 'boolean' }
  },
  execute: ([a, b]) => sql.fn('lte', numeric(a), numeric(b))
}
export const eq = {
  name: 'Equal',
  notes: 'Returns true/false if Value A is equal to Value B',
  category: categories.comparisons,
  signature: [
    {
      name: 'Value A',
      types: ['number', 'date'],
      required: true
    },
    {
      name: 'Value B',
      types: ['number', 'date'],
      required: true
    }
  ],
  returns: {
    static: { type: 'boolean' }
  },
  execute: ([a, b]) => sql.fn('eq', numeric(a), numeric(b))
}

// Time
export const now = {
  name: 'Now',
  notes: 'Returns the current date and time',
  category: categories.time,
  returns: {
    static: { type: 'date' }
  },
  execute: () => sql.fn('now')
}
export const last = {
  name: 'Last',
  notes: 'Returns the date and time for any duration into the past',
  category: categories.time,
  signature: [
    {
      name: 'Duration',
      types: ['text'],
      required: true
    }
  ],
  returns: {
    static: { type: 'date' }
  },
  execute: ([a], opt) => {
    const { raw } = a
    const milli = moment.duration(raw).asMilliseconds()
    if (milli === 0) throw new Error('Invalid duration!')
    return sql.literal(
      `CURRENT_DATE - INTERVAL ${opt.model.sequelize.escape(
        ms(milli, { verbose: true })
      )}`
    )
  }
}
export const interval = {
  name: 'Interval',
  notes: 'Returns the difference in milliseconds between Start and End dates',
  category: categories.time,
  signature: [
    {
      name: 'Start',
      types: ['date'],
      required: true
    },
    {
      name: 'End',
      types: ['date'],
      required: true
    }
  ],
  returns: {
    static: {
      type: 'number',
      measurement: {
        type: 'duration',
        value: 'millisecond'
      }
    }
  },
  execute: ([start, end]) =>
    sql.fn(
      'subtract',
      sql.fn('time_to_ms', end.value),
      sql.fn('time_to_ms', start.value)
    )
}
export const bucket = {
  name: 'Bucket Date',
  notes: 'Returns a date truncated to a unit of time',
  category: categories.time,
  signature: [
    {
      name: 'Unit',
      types: ['text'],
      options: truncates,
      required: true
    },
    {
      name: 'Date',
      types: ['date'],
      required: true
    }
  ],
  returns: {
    static: { type: 'date' },
    dynamic: ([p]) => ({
      type: 'date',
      measurement: {
        type: 'bucket',
        value: p.raw
      }
    })
  },
  execute: ([p, f], { customYearStart = 1, timezone = 'Etc/UTC' } = {}) => {
    const trunc = truncatesToDB[p.raw]
    if (trunc.startsWith('custom')) {
      return sql.fn(
        'date_trunc_with_custom',
        trunc,
        f.value,
        timezone,
        customYearStart
      )
    }
    return sql.fn('date_trunc', trunc, f.value, timezone)
  }
}
export const extract = {
  name: 'Part of Date',
  notes: 'Converts a date to a unit of time',
  category: categories.time,
  signature: [
    {
      name: 'Unit',
      types: ['text'],
      required: true,
      options: parts
    },
    {
      name: 'Date',
      types: ['date'],
      required: true
    }
  ],
  returns: {
    static: { type: 'number' },
    dynamic: ([unitInfo]) => ({
      type: 'number',
      measurement: {
        type: 'datePart',
        value: unitInfo.raw
      }
    })
  },
  execute: ([p, f], { customYearStart = 1, timezone = 'Etc/UTC' } = {}) => {
    const part = partsToDB[p.raw]
    const d = forceTZ(f.value, timezone)
    if (part.startsWith('custom')) {
      return sql.fn('date_part_with_custom', part, d, customYearStart)
    }
    return sql.fn('date_part', part, d)
  }
}

// Geospatial
export const area = {
  name: 'Area',
  notes: 'Returns the area of a polygon in meters',
  category: categories.geospatial,
  signature: [
    {
      name: 'Geometry',
      types: ['polygon', 'multipolygon'],
      required: true
    }
  ],
  returns: {
    static: {
      type: 'number',
      measurement: {
        type: 'area',
        value: 'meter'
      }
    }
  },
  execute: ([f]) => sql.fn('ST_Area', sql.cast(f.value, 'geography'))
}
export const length = {
  name: 'Length',
  notes: 'Returns the length of a line in meters',
  category: categories.geospatial,
  signature: [
    {
      name: 'Geometry',
      types: ['line', 'multiline'],
      required: true
    }
  ],
  returns: {
    static: {
      type: 'number',
      measurement: {
        type: 'distance',
        value: 'meter'
      }
    }
  },
  execute: ([f]) => sql.fn('ST_Length', sql.cast(f.value, 'geography'))
}
export const intersects = {
  name: 'Intersects',
  notes: 'Returns true/false if two geometries intersect',
  category: categories.geospatial,
  signature: [
    {
      name: 'Geometry A',
      types: [
        'point',
        'polygon',
        'multipolygon',
        'line',
        'multiline',
        'geometry'
      ],
      required: true
    },
    {
      name: 'Geometry B',
      types: [
        'point',
        'polygon',
        'multipolygon',
        'line',
        'multiline',
        'geometry'
      ],
      required: true
    }
  ],
  returns: {
    static: { type: 'boolean' }
  },
  execute: ([a, b]) => sql.fn('ST_Intersects', a.value, b.value)
}
export const distance = {
  name: 'Distance',
  notes: 'Returns the distance between two geometries in meters',
  category: categories.geospatial,
  signature: [
    {
      name: 'Geometry A',
      types: [
        'point',
        'polygon',
        'multipolygon',
        'line',
        'multiline',
        'geometry'
      ],
      required: true
    },
    {
      name: 'Geometry B',
      types: [
        'point',
        'polygon',
        'multipolygon',
        'line',
        'multiline',
        'geometry'
      ],
      required: true
    }
  ],
  returns: {
    static: {
      type: 'number',
      measurement: {
        type: 'distance',
        value: 'meter'
      }
    }
  },
  execute: ([a, b]) =>
    sql.fn(
      'ST_Distance',
      sql.cast(a.value, 'geography'),
      sql.cast(b.value, 'geography')
    )
}
export const geojson = {
  name: 'Create Geometry',
  notes: 'Returns a geometry from a GeoJSON string',
  category: categories.geospatial,
  signature: [
    {
      name: 'GeoJSON Text',
      types: ['text'],
      required: true
    }
  ],
  returns: {
    static: { type: 'geometry' },
    dynamic: ([a]) => ({
      type: getGeoReturnType(a.raw)
    })
  },
  execute: ([a]) => getGeometryValue(a.raw)
}
export const boundingBox = {
  name: 'Create Bounding Box',
  notes: 'Returns a bounding box polygon for the given coordinates',
  category: categories.geospatial,
  signature: [
    {
      name: 'X Min',
      types: ['number'],
      required: true
    },
    {
      name: 'Y Min',
      types: ['number'],
      required: true
    },
    {
      name: 'X Max',
      types: ['number'],
      required: true
    },
    {
      name: 'Y Max',
      types: ['number'],
      required: true
    }
  ],
  returns: {
    static: { type: 'polygon' }
  },
  execute: ([xmin, ymin, xmax, ymax]) =>
    sql.fn(
      'ST_SetSRID',
      sql.fn('ST_MakeEnvelope', xmin.value, ymin.value, xmax.value, ymax.value),
      wgs84
    )
}
