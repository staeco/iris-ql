import types from 'sequelize'
import { value } from '../util/toString'
import { BadRequestError } from '../errors'
import moment from 'moment'
import isNumber from 'is-number'
import isObject from 'is-pure-object'

const zones = new Set(moment.tz.names())
const getBasicGeoJSONIssues = (v, type) => {
  if (!isObject(v)) return 'Not a valid object'
  if (v.type !== type) return `Not a valid type value (Expected ${type} not ${v.type})`
}

export const any = {
  name: 'Any',
  test: () => true,
  cast: (txt) => txt
}

export const array = {
  name: 'List',
  items: true,
  // TODO: recursively map the array against the right types
  // this treats everything as a text array
  // probably need to pass in type and let the db figure out casting.
  // should follow moving all casting to db functions
  cast: (txt) => types.fn('fix_jsonb_array', txt)
}

export const object = {
  name: 'Map',
  test: isObject,
  cast: (txt) => types.cast(txt, 'jsonb')
}

export const text = {
  name: 'Text',
  test: (v) => typeof v === 'string',
  cast: (txt) => txt
}
export const number = {
  name: 'Number',
  test: isNumber,
  cast: (txt) => types.cast(txt, 'numeric')
}
export const boolean = {
  name: 'True/False',
  test: (v) => typeof v === 'boolean',
  cast: (txt) => types.cast(txt, 'boolean')
}

export const date = {
  name: 'Date/Time',
  test: (v) => moment(v, moment.ISO_8601).isValid(),
  cast: (txt, { timezone }) => {
    const base = types.fn('to_timestamp', txt, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
    if (!timezone) return base
    if (!zones.has(timezone)) throw new BadRequestError('Not a valid timezone')
    return types.literal(`${value(base)} AT TIME ZONE '${timezone}'`)
  }
}

// geo (EPSG:4979 / WGS84)
const geoCast = (txt) =>
  types.fn('ST_GeomFromGeoJSON', txt)

export const point = {
  name: 'GeoJSON Point',
  geospatial: true,
  test: (v) => !getBasicGeoJSONIssues(v, 'Point'),
  cast: geoCast
}

export const line = {
  name: 'GeoJSON LineString',
  geospatial: true,
  test: (v) => !getBasicGeoJSONIssues(v, 'LineString'),
  cast: geoCast
}
export const multiline = {
  name: 'GeoJSON MultiLineString',
  geospatial: true,
  test: (v) => !getBasicGeoJSONIssues(v, 'MultiLineString'),
  cast: geoCast
}
export const polygon = {
  name: 'GeoJSON Polygon',
  geospatial: true,
  test: (v) => !getBasicGeoJSONIssues(v, 'Polygon'),
  cast: geoCast
}
export const multipolygon = {
  name: 'GeoJSON MultiPolygon',
  geospatial: true,
  test: (v) => !getBasicGeoJSONIssues(v, 'MultiPolygon'),
  cast: geoCast
}
