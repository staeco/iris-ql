import types from 'sequelize'
import capitalize from 'capitalize'
import decamelize from 'decamelize'
import { BadRequestError } from '../errors'
import isObject from 'is-pure-object'

const numeric = (v) => {
  const raw = v.raw || v
  if (raw) {
    if (typeof raw === 'number') return raw
    if (typeof raw === 'string') {
      const parsed = parseFloat(raw)
      if (!isNaN(parsed)) return parsed
    }
  }
  return types.cast(v, 'numeric')
}

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

const partsToDB = {
  millisecond: 'milliseconds',
  second: 'second',
  minute: 'minute',
  hour: 'hour',
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
  returns: 'item-type',
  execute: (f) => types.fn('unnest', f)
}

// Aggregations
export const min = {
  name: 'Minimum',
  notes: 'Aggregates the minimum value of a number',
  signature: [
    {
      name: 'Number',
      types: [ 'number' ],
      required: true
    }
  ],
  returns: 'number',
  aggregate: true,
  execute: (f) => types.fn('min', numeric(f))
}
export const max = {
  name: 'Maximum',
  notes: 'Aggregates the maximum value of a number',
  signature: [
    {
      name: 'Number',
      types: [ 'number' ],
      required: true
    }
  ],
  returns: 'number',
  aggregate: true,
  execute: (f) => types.fn('max', numeric(f))
}
export const sum = {
  name: 'Sum',
  notes: 'Aggregates the sum total of a number',
  signature: [
    {
      name: 'Number',
      types: [ 'number' ],
      required: true
    }
  ],
  returns: 'number',
  aggregate: true,
  execute: (f) => types.fn('sum', numeric(f))
}
export const average = {
  name: 'Average',
  notes: 'Aggregates the average of a number',
  signature: [
    {
      name: 'Number',
      types: [ 'number' ],
      required: true
    }
  ],
  returns: 'number',
  aggregate: true,
  execute: (f) => types.fn('avg', numeric(f))
}
export const median = {
  name: 'Median',
  notes: 'Aggregates the median of a number',
  signature: [
    {
      name: 'Number',
      types: [ 'number' ],
      required: true
    }
  ],
  returns: 'number',
  aggregate: true,
  execute: (f) => types.fn('median', numeric(f))
}
export const count = {
  name: 'Count',
  notes: 'Aggregates the total number of rows',
  returns: 'number',
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
  returns: 'number',
  execute: (a, b) =>
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
  returns: 'number',
  execute: (a, b) =>
    types.fn('sub', numeric(a), numeric(b))
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
  returns: 'number',
  execute: (a, b) =>
    types.fn('mult', numeric(a), numeric(b))
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
  returns: 'number',
  execute: (a, b) =>
    types.fn('div', numeric(a), numeric(b))
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
  returns: 'number',
  execute: (a, b) =>
    types.fn('mod', numeric(a), numeric(b))
}

// Comparisons
export const gt = {
  name: 'Greater Than',
  notes: 'Returns true/false if Value A is greater than Value B',
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
  returns: 'number',
  execute: (a, b) =>
    types.fn('gt', numeric(a), numeric(b))
}
export const lt = {
  name: 'Less Than',
  notes: 'Returns true/false if Value A is less than Value B',
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
  returns: 'number',
  execute: (a, b) =>
    types.fn('lt', numeric(a), numeric(b))
}
export const gte = {
  name: 'Greater Than or Equal',
  notes: 'Returns true/false if Value A is greater than Value B or equal',
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
  returns: 'number',
  execute: (a, b) =>
    types.fn('gte', numeric(a), numeric(b))
}
export const lte = {
  name: 'Less Than or Equal',
  notes: 'Returns true/false if Value A is less than Value B or equal',
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
  returns: 'number',
  execute: (a, b) =>
    types.fn('lte', numeric(a), numeric(b))
}
export const eq = {
  name: 'Equal',
  notes: 'Returns true/false if Value A is equal to Value B',
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
  returns: 'number',
  execute: (a, b) =>
    types.fn('eq', numeric(a), numeric(b))
}

// Time
export const now = {
  name: 'Now',
  notes: 'Returns the current date and time',
  returns: 'date',
  execute: () => types.fn('now')
}
export const lastWeek = {
  name: 'Last Week',
  notes: 'Returns the date and time for 7 days ago',
  returns: 'date',
  execute: () => types.literal("CURRENT_DATE - INTERVAL '7 days'")
}
export const lastMonth = {
  name: 'Last Month',
  notes: 'Returns the date and time for 1 month ago',
  returns: 'date',
  execute: () => types.literal("CURRENT_DATE - INTERVAL '1 month'")
}
export const lastYear = {
  name: 'Last Year',
  notes: 'Returns the date and time for 1 year ago',
  returns: 'date',
  execute: () => types.literal("CURRENT_DATE - INTERVAL '1 year'")
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
  returns: 'number',
  execute: (start, end) =>
    types.fn('sub', types.fn('time_to_ms', end), types.fn('time_to_ms', start))
}
export const truncate = {
  name: 'Truncate',
  notes: 'Returns a date truncated to a certain unit of time',
  signature: [
    {
      name: 'Unit',
      types: [ 'string' ],
      required: true,
      options: truncates
    },
    {
      name: 'Date',
      types: [ 'date' ],
      required: true
    }
  ],
  returns: 'date',
  execute: (p, f) =>
    types.fn('date_trunc', p, f)
}
export const extract = {
  name: 'Extract',
  notes: 'Extracts a measurement of time from a date',
  signature: [
    {
      name: 'Unit',
      types: [ 'string' ],
      required: true,
      options: parts
    },
    {
      name: 'Date',
      types: [ 'date' ],
      required: true
    }
  ],
  returns: 'date',
  execute: (p, f) =>
    types.fn('date_part', p, f)
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
  returns: 'number',
  execute: (f) => types.fn('ST_Area', types.cast(f, 'geography'))
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
  returns: 'number',
  execute: (f) => types.fn('ST_Length', types.cast(f, 'geography'))
}
export const intersects = {
  name: 'Intersects',
  notes: 'Returns true/false if two geometries intersect',
  signature: [
    {
      name: 'Geometry A',
      types: [ 'point', 'polygon', 'multipolygon', 'line', 'multiline' ],
      required: true
    },
    {
      name: 'Geometry B',
      types: [ 'point', 'polygon', 'multipolygon', 'line', 'multiline' ],
      required: true
    }
  ],
  returns: 'boolean',
  execute: (a, b) =>
    types.fn('ST_Intersects', types.cast(a, 'geometry'), types.cast(b, 'geometry'))
}
export const distance = {
  name: 'Distance',
  notes: 'Returns the distance between two geometries in meters',
  signature: [
    {
      name: 'Geometry A',
      types: [ 'point', 'polygon', 'multipolygon', 'line', 'multiline' ],
      required: true
    },
    {
      name: 'Geometry B',
      types: [ 'point', 'polygon', 'multipolygon', 'line', 'multiline' ],
      required: true
    }
  ],
  returns: 'number',
  execute: (a, b) =>
    types.fn('ST_Distance', types.cast(a, 'geometry'), types.cast(b, 'geometry'))
}
export const geojson = {
  name: 'Create Geometry',
  notes: 'Returns a geometry from a GeoJSON string',
  signature: [
    {
      name: 'GeoJSON Text',
      types: [ 'string' ],
      required: true
    }
  ],
  returns: [ 'point', 'polygon', 'multipolygon', 'line', 'multiline' ],
  execute: (v) => {
    let o
    try {
      o = JSON.parse(v)
    } catch (err) {
      throw new BadRequestError('Not a valid object!')
    }
    if (!isObject(o)) throw new BadRequestError('Not a valid object!')
    if (typeof o.type !== 'string') throw new BadRequestError('Not a valid GeoJSON object!')

    // FeatureCollection
    if (Array.isArray(o.features)) return types.fn('geocollection_from_geojson', v)

    // Feature
    if (o.geometry) return types.fn('from_geojson', JSON.stringify(o.geometry))

    // Anything else
    return types.fn('from_geojson', v)
  }
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
  returns: 'polygon',
  execute: (xmin, ymin, xmax, ymax) =>
    types.fn('ST_MakeEnvelope', xmin, ymin, xmax, ymax)
}
