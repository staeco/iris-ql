import types from 'sequelize'
import isObject from 'is-pure-object'
import { BadRequestError } from '../errors'
import { value } from '../util/toString'

const numeric = (v) => types.cast(v, 'numeric')
const truncates = {
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

const parts = {
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

// meta stuff
export const expand = (f) => types.fn('unnest', f)

// aggregations
export const min = (f) => types.fn('min', f)
export const max = (f) => types.fn('max', f)
export const sum = (f) => types.fn('sum', f)
export const average = (f) => types.fn('avg', f)
export const median = (f) => types.fn('median', f)
export const count = (f=types.literal('*')) => types.fn('count', f)

// math
export const gt = (a, b) =>
  types.fn('gt', numeric(a), numeric(b))
export const lt = (a, b) =>
  types.fn('lt', numeric(a), numeric(b))
export const gte = (a, b) =>
  types.fn('gte', numeric(a), numeric(b))
export const lte = (a, b) =>
  types.fn('lte', numeric(a), numeric(b))
export const eq = (a, b) =>
  types.fn('eq', numeric(a), numeric(b))
export const add = (a, b) =>
  types.fn('add', numeric(a), numeric(b))
export const subtract = (a, b) =>
  types.fn('sub', numeric(a), numeric(b))
export const multiply = (a, b) =>
  types.fn('mult', numeric(a), numeric(b))
export const divide = (a, b) =>
  types.fn('div', numeric(a), numeric(b))
export const modulus = (a, b) =>
  types.fn('mod', numeric(a), numeric(b))

// time
export const now = () => types.fn('now')
export const lastWeek = () => types.literal("CURRENT_DATE - INTERVAL '7 days'")
export const lastMonth = () => types.literal("CURRENT_DATE - INTERVAL '1 month'")
export const lastYear = () => types.literal("CURRENT_DATE - INTERVAL '1 year'")
export const interval = (start, end) =>
  types.fn('sub', ms(end), ms(start))

export const ms = (v) =>
  numeric(types.literal(`extract(epoch from ${value({ value: v })}) * 1000`))

export const truncate = (precision, f) => {
  const p = truncates[precision && precision.raw]
  if (!p) throw new BadRequestError('truncate() expects a valid precision argument')
  return types.fn('date_trunc', p, f)
}
export const extract = (part, f) => {
  const p = parts[part && part.raw]
  if (!p) throw new BadRequestError('extract() expects a valid part argument')
  return types.fn('date_part', p, f)
}
export const format = (fmt, f) => types.fn('to_char', f, fmt)

// geospatial
export const area = (f) => types.fn('ST_Area', types.cast(f, 'geography'))
export const length = (f) => types.fn('ST_Length', types.cast(f, 'geography'))
export const intersects = (geo1, geo2) =>
  types.fn('ST_Intersects', types.cast(geo1, 'geometry'), types.cast(geo2, 'geometry'))
export const distance = (geo1, geo2) =>
  types.fn('ST_Distance', types.cast(geo1, 'geometry'), types.cast(geo2, 'geometry'))
export const geojson = (v) => {
  if (!v.raw || typeof v.raw !== 'string') throw new BadRequestError('geojson() expects a string argument')

  const o = JSON.parse(v.raw)
  if (!isObject(o)) throw new BadRequestError('geojson() expects a valid object argument')
  if (typeof o.type !== 'string') throw new BadRequestError('geojson() expects a valid geojson object')

  // FeatureCollection
  if (Array.isArray(o.features)) return types.fn('geocollection_from_geojson', v)

  // Feature
  if (o.geometry) return types.fn('from_geojson', JSON.stringify(o.geometry))

  // Anything else
  return types.fn('from_geojson', v)
}
export const boundingBox = (xmin, ymin, xmax, ymax) =>
  types.fn('ST_MakeEnvelope', xmin, ymin, xmax, ymax)
