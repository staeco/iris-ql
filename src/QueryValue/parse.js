import types from 'sequelize'
import isObject from 'is-pure-object'
import { ValidationError } from '../errors'
import * as funcs from '../types/functions'
import getJSONField from '../util/getJSONField'

const getFunction = (v, { context = [] }) => {
  if (typeof v.function !== 'string') {
    throw new ValidationError({
      path: [ ...context, 'function' ],
      value: v.function,
      message: 'Must be a string.'
    })
  }
  const func = funcs[v.function]
  const args = v.arguments || []
  if (!func) {
    throw new ValidationError({
      path: [ ...context, 'function' ],
      value: v.function,
      message: 'Function does not exist'
    })
  }
  if (!Array.isArray(args)) {
    throw new ValidationError({
      path: [ ...context, 'arguments' ],
      value: v.function,
      message: 'Must be an array.'
    })
  }

  // TODO-IMPL: get type of each function argument, and test against signature
  return { fn: func, args: args }
}

const parse = (v, opt) => {
  const {
    model,
    fieldLimit = Object.keys(opt.model.rawAttributes),
    hydrateJSON = true,
    context = []
  } = opt
  if (v == null) return null
  if (v.function) {
    const { fn, args } = getFunction(v, { context })
    return fn.execute(...args.map((i, idx) =>
      parse(i, {
        ...opt,
        context: [ ...context, 'arguments', idx ]
      })
    ))
  }
  if (v.field) {
    if (typeof v.field !== 'string') {
      throw new ValidationError({
        path: [ ...context, 'field' ],
        value: v.field,
        message: 'Must be a string.'
      })
    }
    if (v.field.includes('.')) return getJSONField(v.field, { ...opt, hydrate: hydrateJSON })
    if (fieldLimit && !fieldLimit.includes(v.field)) {
      throw new ValidationError({
        path: [ ...context, 'field' ],
        value: v.field,
        message: 'Field does not exist.'
      })
    }
    return types.col(v.field)
  }
  if (typeof v === 'string' || typeof v === 'number') {
    const safe = types.literal(model.sequelize.escape(v))
    safe.raw = v
    return safe
  }
  if (!isObject(v)) {
    throw new ValidationError({
      path: context,
      value: v,
      message: 'Must be a function, field, string, number, or object.'
    })
  }
  // TODO: is allowing an object here a security issue?
  return v
}

export default parse
