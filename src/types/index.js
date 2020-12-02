import sql from 'sequelize'
import { types } from 'human-schema'

const wgs84 = 4326
const geoCast = (txt) =>
  sql.fn('ST_SetSRID', sql.fn('ST_GeomFromGeoJSON', txt), wgs84)

// hydrate is used to hydrate db text values to their properly typed values
export const array = {
  ...types.array,
  // TODO: recursively map the array against the right types
  // this treats everything as a text array
  // probably need to pass in type and let the db figure out hydrating
  hydrate: (txt) => sql.fn('fix_jsonb_array', txt)
}
export const object = {
  ...types.object,
  hydrate: (txt) => sql.cast(txt, 'jsonb')
}
export const text = {
  ...types.text,
  hydrate: (txt) => txt
}
export const number = {
  ...types.number,
  hydrate: (txt) => sql.cast(txt, 'numeric')
}
export const boolean = {
  ...types.boolean,
  hydrate: (txt) => sql.cast(txt, 'boolean')
}
export const date = {
  ...types.date,
  hydrate: (txt) => sql.fn('parse_iso', txt)
}
export const point = {
  ...types.point,
  hydrate: geoCast
}
export const line = {
  ...types.line,
  hydrate: geoCast
}
export const multiline = {
  ...types.multiline,
  hydrate: geoCast
}
export const polygon = {
  ...types.polygon,
  hydrate: geoCast
}
export const multipolygon = {
  ...types.multipolygon,
  hydrate: geoCast
}
