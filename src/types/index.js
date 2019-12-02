import types from 'sequelize'
import { BadRequestError } from '../errors'
import moment from 'moment-timezone'
import isNumber from 'is-number'
import isObject from 'is-plain-obj'

const zones = new Set(moment.tz.names())
const getBasicGeoJSONIssues = (v, type) => {
  if (!isObject(v)) return 'Not a valid object'
  if (v.type !== type) return `Not a valid type value (Expected ${type} not ${v.type})`
}

// test is used to validate and type user-inputted values
// hydrate is used to hydrate db text values to their properly typed values
export const array = {
  name: 'List',
  items: true,
  check: (v) => Array.isArray(v),
  // TODO: recursively map the array against the right types
  // this treats everything as a text array
  // probably need to pass in type and let the db figure out hydrating
  hydrate: (txt) => types.fn('fix_jsonb_array', txt)
}

export const object = {
  name: 'Map',
  check: isObject,
  hydrate: (txt) => types.cast(txt, 'jsonb')
}

export const text = {
  name: 'Text',
  check: (v) => typeof v === 'string',
  hydrate: (txt) => txt
}
export const number = {
  name: 'Number',
  check: (v) => isNumber(v),
  hydrate: (txt) => types.cast(txt, 'numeric')
}
export const boolean = {
  name: 'True/False',
  check: (v) => typeof v === 'boolean',
  hydrate: (txt) => types.cast(txt, 'boolean')
}

export const date = {
  name: 'Date/Time',
  check: (v) => moment(v, moment.ISO_8601).isValid(),
  hydrate: (txt, { timezone }) => {
    if (!timezone) return types.fn('parse_iso', txt)
    if (!zones.has(timezone)) throw new BadRequestError('Not a valid timezone')
    return types.fn('force_tz', types.fn('parse_iso', txt), timezone)
  }
}

// geo (EPSG:4979 / WGS84)
const geoCast = (txt) =>
  types.fn('ST_GeomFromGeoJSON', txt)

export const point = {
  name: 'GeoJSON Point',
  check: (v) => !getBasicGeoJSONIssues(v, 'Point'),
  hydrate: geoCast
}
export const line = {
  name: 'GeoJSON LineString',
  check: (v) => !getBasicGeoJSONIssues(v, 'LineString'),
  hydrate: geoCast
}
export const multiline = {
  name: 'GeoJSON MultiLineString',
  check: (v) => !getBasicGeoJSONIssues(v, 'MultiLineString'),
  hydrate: geoCast
}
export const polygon = {
  name: 'GeoJSON Polygon',
  check: (v) => !getBasicGeoJSONIssues(v, 'Polygon'),
  hydrate: geoCast
}
export const multipolygon = {
  name: 'GeoJSON MultiPolygon',
  check: (v) => !getBasicGeoJSONIssues(v, 'MultiPolygon'),
  hydrate: geoCast
}
