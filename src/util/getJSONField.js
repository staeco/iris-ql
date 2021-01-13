import sql from 'sequelize'
import { jsonPath } from './toString'
import * as schemaTypes from '../types'
import { ValidationError } from '../errors'
import getModelFieldLimit from './getModelFieldLimit'

export default (v, opt) => {
  const {
    context = [],
    subSchemas = {},
    model,
    fieldLimit = getModelFieldLimit(model),
    instanceQuery,
    from,
    hydrateJSON = true
  } = opt
  const path = v.split('.')
  const col = path.shift()
  const colInfo = model.rawAttributes[col]
  if (!colInfo || !fieldLimit.find((i) => i.field === col)) {
    throw new ValidationError({
      path: context,
      value: v,
      message: `Field does not exist: ${col}`
    })
  }
  if (!(colInfo.type instanceof sql.JSONB || colInfo.type instanceof sql.JSON)) {
    throw new ValidationError({
      path: context,
      value: v,
      message: `Field is not JSON: ${col}`
    })
  }
  const lit = sql.literal(jsonPath({ column: col, model, path, from, instanceQuery }))
  const schema = subSchemas[col] || colInfo.subSchema
  if (!schema) {
    // did not give sufficient info to query json objects safely!
    throw new ValidationError({
      path: context,
      value: v,
      message: `Field is not queryable: ${col}`
    })
  }
  if (!hydrateJSON) return lit // asked to keep it raw

  // if a schema is specified, check the type of the field to see if it needs hydrating
  // this is because pg treats all json values as text, so we need to explicitly hydrate types for things
  // to work the way we expect
  const field = path[0]
  const attrDef = schema[field]
  if (!attrDef) {
    throw new ValidationError({
      path: context,
      value: v,
      message: `Field does not exist: ${col}.${field}`
    })
  }
  return schemaTypes[attrDef.type].hydrate(lit)
}
