import types from 'sequelize'
import capitalize from 'capitalize'
import decamelize from 'decamelize'
import { BadRequestError } from '../errors'
import isObject from 'is-pure-object'

const numeric = (info) => {
  if (info.raw) {
    if (typeof raw === 'number') return info.raw
    if (typeof raw === 'string') {
      const parsed = parseFloat(info.raw)
      if (!isNaN(parsed)) return parsed
    }
  }
  if (info.types.includes('date')) {
    return types.cast(types.fn('time_to_ms', info.value), 'numeric')
  }
  return types.cast(info.value, 'numeric')
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
  returns: (listInfo) => listInfo.types.find((i) => i.type === 'array').items,
  execute: (listInfo) => types.fn('unnest', listInfo.value)
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
  returns: (valueInfo) => {
    const primaryType = valueInfo.types.find((i) => min.signature[0].types.includes(i.type))
    return {
      type: primaryType,
      measurement: primaryType.measurement
    }
  },
  aggregate: true,
  execute: (f) => types.fn('min', numeric(f))
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
  returns: (valueInfo) => {
    const primaryType = valueInfo.types.find((i) => max.signature[0].types.includes(i.type))
    return {
      type: primaryType,
      measurement: primaryType.measurement
    }
  },
  aggregate: true,
  execute: (f) => types.fn('max', numeric(f))
}
export const sum = {
  name: 'Sum',
  notes: 'Aggregates the sum total of a number',
  signature: [
    {
      name: 'Value',
      types: [ 'number', 'date' ],
      required: true
    }
  ],
  returns: (valueInfo) => {
    const primaryType = valueInfo.types.find((i) => sum.signature[0].types.includes(i.type))
    return {
      type: primaryType,
      measurement: primaryType.measurement
    }
  },
  aggregate: true,
  execute: (f) => types.fn('sum', numeric(f))
}
export const average = {
  name: 'Average',
  notes: 'Aggregates the average of a number',
  signature: [
    {
      name: 'Value',
      types: [ 'number', 'date' ],
      required: true
    }
  ],
  returns: (valueInfo) => {
    const primaryType = valueInfo.types.find((i) => average.signature[0].types.includes(i.type))
    return {
      type: primaryType,
      measurement: primaryType.measurement
    }
  },
  aggregate: true,
  execute: (f) => types.fn('avg', numeric(f))
}
export const median = {
  name: 'Median',
  notes: 'Aggregates the median of a number',
  signature: [
    {
      name: 'Value',
      types: [ 'number', 'date' ],
      required: true
    }
  ],
  returns: (valueInfo) => {
    const primaryType = valueInfo.types.find((i) => median.signature[0].types.includes(i.type))
    return {
      type: primaryType,
      measurement: primaryType.measurement
    }
  },
  aggregate: true,
  execute: (f) => types.fn('median', numeric(f))
}
export const count = {
  name: 'Count',
  notes: 'Aggregates the total number of rows',
  returns: {
    type: 'number'
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
  returns: (infoA, infoB) => {
    const primaryTypeA = infoA.types.find((i) => i.type === 'number')
    const primaryTypeB = infoB.types.find((i) => i.type === 'number')
    return {
      type: 'number',
      measurement: primaryTypeA.measurement || primaryTypeB.measurement
    }
  },
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
  returns: (infoA, infoB) => {
    const primaryTypeA = infoA.types.find((i) => i.type === 'number')
    const primaryTypeB = infoB.types.find((i) => i.type === 'number')
    return {
      type: 'number',
      measurement: primaryTypeA.measurement || primaryTypeB.measurement
    }
  },
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
  returns: (infoA, infoB) => {
    const primaryTypeA = infoA.types.find((i) => i.type === 'number')
    const primaryTypeB = infoB.types.find((i) => i.type === 'number')
    return {
      type: 'number',
      measurement: primaryTypeA.measurement || primaryTypeB.measurement
    }
  },
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
  returns: (infoA, infoB) => {
    const primaryTypeA = infoA.types.find((i) => i.type === 'number')
    const primaryTypeB = infoB.types.find((i) => i.type === 'number')
    return {
      type: 'number',
      measurement: primaryTypeA.measurement || primaryTypeB.measurement
    }
  },
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
  returns: (infoA, infoB) => {
    const primaryTypeA = infoA.types.find((i) => i.type === 'number')
    const primaryTypeB = infoB.types.find((i) => i.type === 'number')
    return {
      type: 'number',
      measurement: primaryTypeA.measurement || primaryTypeB.measurement
    }
  },
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
    type: 'boolean'
  },
  execute: (a, b) =>
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
    type: 'boolean'
  },
  execute: (a, b) =>
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
    type: 'boolean'
  },
  execute: (a, b) =>
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
    type: 'boolean'
  },
  execute: (a, b) =>
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
    type: 'boolean'
  },
  execute: (a, b) =>
    types.fn('eq', numeric(a), numeric(b))
}

// Time
export const now = {
  name: 'Now',
  notes: 'Returns the current date and time',
  returns: {
    type: 'date'
  },
  execute: () => types.fn('now')
}
export const lastWeek = {
  name: 'Last Week',
  notes: 'Returns the date and time for 7 days ago',
  returns: {
    type: 'date'
  },
  execute: () => types.literal("CURRENT_DATE - INTERVAL '7 days'")
}
export const lastMonth = {
  name: 'Last Month',
  notes: 'Returns the date and time for 1 month ago',
  returns: {
    type: 'date'
  },
  execute: () => types.literal("CURRENT_DATE - INTERVAL '1 month'")
}
export const lastYear = {
  name: 'Last Year',
  notes: 'Returns the date and time for 1 year ago',
  returns: {
    type: 'date'
  },
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
  returns: {
    type: 'number',
    measurement: {
      type: 'duration',
      value: 'millisecond'
    }
  },
  execute: (start, end) =>
    types.fn('sub', types.fn('time_to_ms', end.value), types.fn('time_to_ms', start.value))
}
export const truncate = {
  name: 'Truncate',
  notes: 'Returns a date truncated to a certain unit of time',
  signature: [
    {
      name: 'Unit',
      types: [ 'text' ],
      required: true,
      options: truncates
    },
    {
      name: 'Date',
      types: [ 'date' ],
      required: true
    }
  ],
  returns: {
    type: 'date'
  },
  execute: (p, f) =>
    types.fn('date_trunc', truncatesToDB[p.raw], f.value)
}
export const extract = {
  name: 'Extract',
  notes: 'Extracts a measurement of time from a date',
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
  returns: (unitInfo) => ({
    type: 'number',
    measurement: {
      type: 'datePart',
      value: unitInfo.raw
    }
  }),
  execute: (p, f) =>
    types.fn('date_part', partsToDB[p.raw], f.value)
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
    type: 'number',
    measurement: {
      type: 'area',
      value: 'meter'
    }
  },
  execute: (f) => types.fn('ST_Area', types.cast(f.value, 'geography'))
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
    type: 'number',
    measurement: {
      type: 'distance',
      value: 'meter'
    }
  },
  execute: (f) => types.fn('ST_Length', types.cast(f.value, 'geography'))
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
  returns: {
    type: 'boolean'
  },
  execute: (a, b) =>
    types.fn('ST_Intersects', types.cast(a.value, 'geometry'), types.cast(b.value, 'geometry'))
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
  returns: {
    type: 'number',
    measurement: {
      type: 'distance',
      value: 'meter'
    }
  },
  execute: (a, b) =>
    types.fn('ST_Distance', types.cast(a.value, 'geometry'), types.cast(b.value, 'geometry'))
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
  returns: [ 'point', 'polygon', 'multipolygon', 'line', 'multiline' ],
  execute: ({ raw }) => {
    let o
    try {
      o = JSON.parse(raw)
    } catch (err) {
      throw new BadRequestError('Not a valid object!')
    }
    if (!isObject(o)) throw new BadRequestError('Not a valid object!')
    if (typeof o.type !== 'string') throw new BadRequestError('Not a valid GeoJSON object!')

    // FeatureCollection
    if (Array.isArray(o.features)) return types.fn('geocollection_from_geojson', raw)

    // Feature
    if (o.geometry) return types.fn('from_geojson', JSON.stringify(o.geometry))

    // Anything else
    return types.fn('from_geojson', raw)
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
  returns: {
    type: 'polygon'
  },
  execute: (xmin, ymin, xmax, ymax) =>
    types.fn('ST_MakeEnvelope', xmin.value, ymin.value, xmax.value, ymax.value)
}
