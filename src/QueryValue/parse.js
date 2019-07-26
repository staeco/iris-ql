import types from 'sequelize'
import isObject from 'is-pure-object'
import { ValidationError } from '../errors'
import * as funcs from '../functions'
import getJSONField from '../util/getJSONField'

const baseParse = (v, opt) => {
  const {
    table,
    fieldLimit = Object.keys(opt.table.rawAttributes),
    castJSON = true,
    context = []
  } = opt
  if (v == null) return null
  if (v.function) {
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
    return func(...args.map((i, idx) =>
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
    if (v.field.includes('.')) return getJSONField(v.field, { ...opt, cast: castJSON })
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
    const slit = types.literal(table.sequelize.escape(v))
    slit.raw = v // expose raw value so functions can optionally take this as an argument
    return slit
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

const parse = (v, opt) => {
  const { context=[] } = opt
  const ret = baseParse(v, opt)
  if (!v.as) return ret
  if (typeof v.as !== 'string') {
    throw new ValidationError({
      path: [ ...context, 'as' ],
      value: v.as,
      message: 'Must be a string.'
    })
  }
  return types.cast(ret, v.as)
}

export default parse
