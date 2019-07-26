import { literal } from 'sequelize'
import { jsonPath } from './toString'
import * as dataTypeTypes from '../types'
import { ValidationError } from '../errors'

// TODO: convert to use plain sequelize info, not custom table
export default (v, opt) => {
  const {
    context = [],
    dataType,
    table,
    fieldLimit = Object.keys(table.rawAttributes),
    cast = true
  } = opt
  const path = v.split('.')
  const col = path.shift()
  if (fieldLimit && !fieldLimit.includes(col)) {
    throw new ValidationError({
      path: context,
      value: v,
      message: `Field does not exist: ${col}`
    })
  }
  const lit = literal(jsonPath({ column: col, table, path }))
  if (!dataType || !cast) return lit // non-dataType json fields, or asked to keep it raw

  // if a dataType is specified, check the type of the field to see if it needs casting
  // this is because pg treats all json values as text, so we need to explicitly cast types for things
  // to work the way we expect
  const field = path[0]
  const attrDef = dataType.schema[field]
  if (!attrDef) {
    throw new ValidationError({
      path: context,
      value: v,
      message: `Field does not exist: ${col}.${field}`
    })
  }
  return dataTypeTypes[attrDef.type].cast(lit, { ...opt, attr: attrDef })
}
