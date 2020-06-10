import types from 'sequelize'
import capitalize from 'capitalize'
import decamelize from 'decamelize'
import moment from 'moment-timezone'
import { BadRequestError } from '../errors'
import { multiline, line, point, polygon, multipolygon } from './'
import { force as forceTZ, shift as shiftTZ } from '../util/tz'
import isObject from 'is-plain-obj'
import ms from 'pretty-ms'


// some operations we don't want to display a percentage after, for example:
// 33% * 100,000 should return 33,000 as a flat integer
// 100,000 / 77% should return 130,000 as a flat integer
const isPercentage = (i) => i.measurement?.type === 'percentage'
const inheritNumeric = ({ retainPercentage }, [ infoA, infoB ]) => {
  const filter = (i) => i.type === 'number' && (retainPercentage || !isPercentage(i))
  const primaryTypeA = infoA?.types.find(filter)
  const primaryTypeB = infoB?.types.find(filter)
  return {
    type: 'number',
    measurement: primaryTypeA?.measurement || primaryTypeB?.measurement
  }
}

const numeric = (info) => {
  if (info.value.type === 'numeric') return info.value // already cast as numeric
  const flatTypes = info.types.map((i) => i.type)
  //if (flatTypes.includes('number')) return info.value // already a number
  if (flatTypes.includes('date')) {
    return types.cast(types.fn('time_to_ms', info.value), 'numeric')
  }
  return types.cast(info.value, 'numeric')
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
  if (point.check(o)) return 'point'
  if (line.check(o)) return 'line'
  if (multiline.check(o)) return 'multiline'
  if (polygon.check(o)) return 'polygon'
  if (multipolygon.check(o)) return 'multipolygon'
  return 'geometry'
}

const getGeometryValue = (raw) => {
  let o
  try {
    o = JSON.parse(raw)
  } catch (err) {
    throw new BadRequestError('Not a valid object!')
  }
  if (!isObject(o)) throw new BadRequestError('Not a valid object!')
  if (typeof o.type !== 'string') throw new BadRequestError('Not a valid GeoJSON object!')

  // FeatureCollection
  if (Array.isArray(o.features)) return types.fn('from_geojson_collection', raw)

  // Feature
  if (o.geometry) return getGeometryValue(JSON.stringify(o.geometry))

  // Anything else
  return types.fn('from_geojson', raw)
}

const partsToDB = {
  millisecond: 'milliseconds',
  second: 'second',
  minute: 'minute',
  hourOfDay: 'hour',
  dayOfWeek: 'dow',
  dayOfMonth: 'day',
  dayOfYear: 'doy',
  week: 'week',
  month: 'month',
  quarter: 'quarter',
  year: 'year',
  decade: 'decade'
}
const parts = Object.keys(partsToDB).map((k) => ({
  value: k,
  label: capitalize.words(decamelize(k, ' '))
}))

const truncatesToDB = {
  millisecond: 'milliseconds',
  second: 'second',
  minute: 'minute',
  hour: 'hour',
  day: 'day',
  week: 'week',
  month: 'month',
  quarter: 'quarter',
  year: 'year',
  decade: 'decade'
}
const truncates = Object.keys(truncatesToDB).map((k) => ({
  value: k,
  label: capitalize(k)
}))

// Arrays
export const expand = {
  name: 'Expand',
  notes: 'Expands a list to a set of rows',
  signature: [
    {
      name: 'List',
      types: [ 'array' ],
      required: true
    }
  ],
  returns: {
    static: { type: 'any' },
    dynamic: ([ listInfo ]) => listInfo.types.find((i) => i.type === 'array').items
  },
  execute: ([ listInfo ]) => types.fn('unnest', listInfo.value)
}

// Aggregations
export const min = {
  name: 'Minimum',
  notes: 'Aggregates the minimum value of a number',
  signature: [
    {
      name: 'Value',
      types: [ 'number', 'date' ],
      required: true
    }
  ],
  returns: {
    static: { type: 'number' },
    dynamic: inheritNumeric.bind(null, { retainPercentage: true })
  },
  aggregate: true,
  execute: ([ f ]) => types.fn('min', numeric(f))
}
export const max = {
  name: 'Maximum',
  notes: 'Aggregates the maximum value of a number',
  signature: [
    {
      name: 'Value',
      types: [ 'number', 'date' ],
      required: true
    }
  ],
  returns: {
    static: { type: 'number' },
    dynamic: inheritNumeric.bind(null, { retainPercentage: true })
  },
  aggregate: true,
  execute: ([ f ]) => types.fn('max', numeric(f))
}
export const sum = {
  name: 'Sum',
  notes: 'Aggregates the sum total of a number',
  signature: [
    {
      name: 'Value',
      types: [ 'number' ],
      required: true
    }
  ],
  returns: {
    static: { type: 'number' },
    dynamic: inheritNumeric.bind(null, { retainPercentage: true })
  },
  aggregate: true,
  execute: ([ f ]) => types.fn('sum', numeric(f))
}
export const average = {
  name: 'Average',
  notes: 'Aggregates the average of a number',
  signature: [
    {
      name: 'Value',
      types: [ 'number' ],
      required: true
    }
  ],
  returns: {
    static: { type: 'number' },
    dynamic: inheritNumeric.bind(null, { retainPercentage: true })
  },
  aggregate: true,
  execute: ([ f ]) => types.fn('avg', numeric(f))
}
export const median = {
  name: 'Median',
  notes: 'Aggregates the median of a number',
  signature: [
    {
      name: 'Value',
      types: [ 'number' ],
      required: true
    }
  ],
  returns: {
    static: { type: 'number' },
    dynamic: inheritNumeric.bind(null, { retainPercentage: true })
  },
  aggregate: true,
  execute: ([ f ]) => types.fn('median', numeric(f))
}
export const count = {
  name: 'Total Count',
  notes: 'Aggregates the total number of rows',
  returns: {
    static: { type: 'number' }
  },
  aggregate: true,
  execute: () => types.fn('count', types.literal('*'))
}

// Math
export const add = {
  name: 'Add',
  notes: 'Applies addition to multiple numbers',
  signature: [
    {
      name: 'Value A',
      types: [ 'number' ],
      required: true
    },
    {
      name: 'Value B',
      types: [ 'number' ],
      required: true
    }
  ],
  returns: {
    static: { type: 'number' },
    dynamic: inheritNumeric.bind(null, { retainPercentage: true })
  },
  execute: ([ a, b ]) =>
    types.fn('add', numeric(a), numeric(b))
}
export const subtract = {
  name: 'Subtract',
  notes: 'Applies subtraction to multiple numbers',
  signature: [
    {
      name: 'Value A',
      types: [ 'number' ],
      required: true
    },
    {
      name: 'Value B',
      types: [ 'number' ],
      required: true
    }
  ],
  returns: {
    static: { type: 'number' },
    dynamic: inheritNumeric.bind(null, { retainPercentage: true })
  },
  execute: ([ a, b ]) =>
    types.fn('subtract', numeric(a), numeric(b))
}
export const multiply = {
  name: 'Multiply',
  notes: 'Applies multiplication to multiple numbers',
  signature: [
    {
      name: 'Value A',
      types: [ 'number' ],
      required: true
    },
    {
      name: 'Value B',
      types: [ 'number' ],
      required: true
    }
  ],
  returns: {
    static: { type: 'number' },
    dynamic: inheritNumeric.bind(null, { retainPercentage: false })
  },
  execute: ([ a, b ]) =>
    types.fn('multiply', numeric(a), numeric(b))
}
export const divide = {
  name: 'Divide',
  notes: 'Applies division to multiple numbers',
  signature: [
    {
      name: 'Value A',
      types: [ 'number' ],
      required: true
    },
    {
      name: 'Value B',
      types: [ 'number' ],
      required: true
    }
  ],
  returns: {
    static: { type: 'number' },
    dynamic: inheritNumeric.bind(null, { retainPercentage: false })
  },
  execute: ([ a, b ]) =>
    types.fn('divide', numeric(a), numeric(b))
}
export const percentage = {
  name: 'Percentage',
  notes: 'Returns the percentage of Value A in Value B',
  signature: [
    {
      name: 'Value A',
      types: [ 'number' ],
      required: true
    },
    {
      name: 'Value B',
      types: [ 'number' ],
      required: true
    }
  ],
  returns: {
    static: {
      type: 'number',
      measurement: {
        type: 'percentage'
      }
    }
  },
  execute: ([ a, b ]) =>
    types.fn('divide', numeric(b), numeric(a))
}
export const remainder = {
  name: 'Remainder',
  notes: 'Applies division to multiple numbers and returns the remainder/modulus',
  signature: [
    {
      name: 'Value A',
      types: [ 'number' ],
      required: true
    },
    {
      name: 'Value B',
      types: [ 'number' ],
      required: true
    }
  ],
  returns: {
    static: { type: 'number' },
    dynamic: inheritNumeric.bind(null, { retainPercentage: false })
  },
  execute: ([ a, b ]) =>
    types.fn('modulus', numeric(a), numeric(b))
}

// Comparisons
export const gt = {
  name: 'Greater Than',
  notes: 'Returns true/false if Value A is greater than Value B',
  signature: [
    {
      name: 'Value A',
      types: [ 'number', 'date' ],
      required: true
    },
    {
      name: 'Value B',
      types: [ 'number', 'date' ],
      required: true
    }
  ],
  returns: {
    static: { type: 'boolean' }
  },
  execute: ([ a, b ]) =>
    types.fn('gt', numeric(a), numeric(b))
}
export const lt = {
  name: 'Less Than',
  notes: 'Returns true/false if Value A is less than Value B',
  signature: [
    {
      name: 'Value A',
      types: [ 'number', 'date' ],
      required: true
    },
    {
      name: 'Value B',
      types: [ 'number', 'date' ],
      required: true
    }
  ],
  returns: {
    static: { type: 'boolean' }
  },
  execute: ([ a, b ]) =>
    types.fn('lt', numeric(a), numeric(b))
}
export const gte = {
  name: 'Greater Than or Equal',
  notes: 'Returns true/false if Value A is greater than Value B or equal',
  signature: [
    {
      name: 'Value A',
      types: [ 'number', 'date' ],
      required: true
    },
    {
      name: 'Value B',
      types: [ 'number', 'date' ],
      required: true
    }
  ],
  returns: {
    static: { type: 'boolean' }
  },
  execute: ([ a, b ]) =>
    types.fn('gte', numeric(a), numeric(b))
}
export const lte = {
  name: 'Less Than or Equal',
  notes: 'Returns true/false if Value A is less than Value B or equal',
  signature: [
    {
      name: 'Value A',
      types: [ 'number', 'date' ],
      required: true
    },
    {
      name: 'Value B',
      types: [ 'number', 'date' ],
      required: true
    }
  ],
  returns: {
    static: { type: 'boolean' }
  },
  execute: ([ a, b ]) =>
    types.fn('lte', numeric(a), numeric(b))
}
export const eq = {
  name: 'Equal',
  notes: 'Returns true/false if Value A is equal to Value B',
  signature: [
    {
      name: 'Value A',
      types: [ 'number', 'date' ],
      required: true
    },
    {
      name: 'Value B',
      types: [ 'number', 'date' ],
      required: true
    }
  ],
  returns: {
    static: { type: 'boolean' }
  },
  execute: ([ a, b ]) =>
    types.fn('eq', numeric(a), numeric(b))
}

// Time
export const now = {
  name: 'Now',
  notes: 'Returns the current date and time',
  returns: {
    static: { type: 'date' }
  },
  execute: () => types.fn('now')
}
export const last = {
  name: 'Last',
  notes: 'Returns the date and time for any duration into the past',
  signature: [
    {
      name: 'Duration',
      types: [ 'text' ],
      required: true
    }
  ],
  returns: {
    static: { type: 'date' }
  },
  execute: ([ a ], opt) => {
    const { raw } = a
    const milli = moment.duration(raw).asMilliseconds()
    if (milli === 0) throw new BadRequestError('Invalid duration')
    return types.literal(`CURRENT_DATE - INTERVAL ${opt.model.sequelize.escape(ms(milli, { verbose: true }))}`)
  }
}
export const interval = {
  name: 'Interval',
  notes: 'Returns the difference in milliseconds between Start and End dates',
  signature: [
    {
      name: 'Start',
      types: [ 'date' ],
      required: true
    },
    {
      name: 'End',
      types: [ 'date' ],
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
  execute: ([ start, end ]) =>
    types.fn('subtract', types.fn('time_to_ms', end.value), types.fn('time_to_ms', start.value))
}
export const bucket = {
  name: 'Bucket',
  notes: 'Returns a date rounded to a unit of time',
  signature: [
    {
      name: 'Unit',
      types: [ 'text' ],
      options: truncates,
      required: true
    },
    {
      name: 'Date',
      types: [ 'date' ],
      required: true
    }
  ],
  returns: {
    static: { type: 'date' }
  },
  execute: ([ p, f ], opt) => {
    const useTZ = !!opt?.timezone
    if (useTZ) return shiftTZ(types.fn('date_trunc', truncatesToDB[p.raw], f.value), opt)
    return types.fn('date_trunc', truncatesToDB[p.raw], f.value)
  }
}
export const extract = {
  name: 'Extract',
  notes: 'Converts a date to a unit of time',
  signature: [
    {
      name: 'Unit',
      types: [ 'text' ],
      required: true,
      options: parts
    },
    {
      name: 'Date',
      types: [ 'date' ],
      required: true
    }
  ],
  returns: {
    static: { type: 'number' },
    dynamic: ([ unitInfo ]) => ({
      type: 'number',
      measurement: {
        type: 'datePart',
        value: unitInfo.raw
      }
    })
  },
  execute: ([ p, f ], opt) =>
    types.fn('date_part', partsToDB[p.raw], forceTZ(f.value, opt))
}

// Geospatial
export const area = {
  name: 'Area',
  notes: 'Returns the area of a polygon in meters',
  signature: [
    {
      name: 'Geometry',
      types: [ 'polygon', 'multipolygon' ],
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
  execute: ([ f ]) =>
    types.fn('ST_Area', types.cast(f.value, 'geography'))
}
export const length = {
  name: 'Length',
  notes: 'Returns the length of a line in meters',
  signature: [
    {
      name: 'Geometry',
      types: [ 'line', 'multiline' ],
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
  execute: ([ f ]) =>
    types.fn('ST_Length', types.cast(f.value, 'geography'))
}
export const intersects = {
  name: 'Intersects',
  notes: 'Returns true/false if two geometries intersect',
  signature: [
    {
      name: 'Geometry A',
      types: [ 'point', 'polygon', 'multipolygon', 'line', 'multiline', 'geometry' ],
      required: true
    },
    {
      name: 'Geometry B',
      types: [ 'point', 'polygon', 'multipolygon', 'line', 'multiline', 'geometry' ],
      required: true
    }
  ],
  returns: {
    static: { type: 'boolean' }
  },
  execute: ([ a, b ]) =>
    types.fn('ST_Intersects', types.cast(a.value, 'geometry'), types.cast(b.value, 'geometry'))
}
export const distance = {
  name: 'Distance',
  notes: 'Returns the distance between two geometries in meters',
  signature: [
    {
      name: 'Geometry A',
      types: [ 'point', 'polygon', 'multipolygon', 'line', 'multiline', 'geometry' ],
      required: true
    },
    {
      name: 'Geometry B',
      types: [ 'point', 'polygon', 'multipolygon', 'line', 'multiline', 'geometry' ],
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
  execute: ([ a, b ]) =>
    types.fn('ST_Distance', types.cast(a.value, 'geography'), types.cast(b.value, 'geography'))
}
export const geojson = {
  name: 'Create Geometry',
  notes: 'Returns a geometry from a GeoJSON string',
  signature: [
    {
      name: 'GeoJSON Text',
      types: [ 'text' ],
      required: true
    }
  ],
  returns: {
    static: { type: 'geometry' },
    dynamic: ([ a ]) => ({
      type: getGeoReturnType(a.raw)
    })
  },
  execute: ([ a ]) => getGeometryValue(a.raw)
}
export const boundingBox = {
  name: 'Create Bounding Box',
  notes: 'Returns a bounding box polygon for the given coordinates',
  signature: [
    {
      name: 'X Min',
      types: [ 'number' ],
      required: true
    },
    {
      name: 'Y Min',
      types: [ 'number' ],
      required: true
    },
    {
      name: 'X Max',
      types: [ 'number' ],
      required: true
    },
    {
      name: 'Y Max',
      types: [ 'number' ],
      required: true
    }
  ],
  returns: {
    static: { type: 'polygon' }
  },
  execute: ([ xmin, ymin, xmax, ymax ]) =>
    types.fn('ST_SetSRID', types.fn('ST_MakeEnvelope', xmin.value, ymin.value, xmax.value, ymax.value), 4326)
}
