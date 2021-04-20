import sql from 'sequelize'
import isNumber from 'is-number'
import { types } from 'human-schema'

const geoCast = (txt) =>
  sql.fn('from_geojson', txt)

// Extend human-schema types and:
// - add a hydrate function to go from db text values -> properly typed values
// - make some types more permissive, since queries are often passed in via querystring

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
  test: isNumber,
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
