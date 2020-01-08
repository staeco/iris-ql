import types from 'sequelize'
import isObject from 'is-plain-obj'
import { ValidationError } from '../errors'
import getTypes from '../types/getTypes'
import * as funcs from '../types/functions'
import getJSONField from '../util/getJSONField'

const validateArgumentTypes = (func, sig, arg, opt) => {
  if (sig.types === 'any') return true // allows anything
  if (!sig.required && arg == null) return true // not present, so has a default
  if (sig.required && arg == null) {
    throw new ValidationError({
      path: opt.context,
      value: arg,
      message: `Argument "${sig.name}" for "${func.name}" is required`
    })
  }
  const enumm = sig.options?.map((i) => i.value)
  if (enumm && !enumm.includes(arg)) {
    throw new ValidationError({
      path: opt.context,
      value: arg,
      message: `Argument "${sig.name}" for "${func.name}" must be one of: ${enumm.join(', ')}`
    })
  }
  const argTypes = getTypes(arg, opt).map((t) => t.type)
  const typesValid = argTypes.some((t) => sig.types.includes(t))
  if (!typesValid) {
    throw new ValidationError({
      path: opt.context,
      value: arg,
      message: `Argument "${sig.name}" for "${func.name}" must be of type: ${sig.types.join(', ')} - instead got ${argTypes.length === 0 ? '<none>' : argTypes.join(', ')}`
    })
  }
  return true
}

const getFunction = (v, opt) => {
  const { context = [] } = opt
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

  // resolve function arguments, then check the types against the function signature
  const sigArgs = func.signature || []
  const resolvedArgs = sigArgs.map((sig, idx) => {
    const nopt = {
      ...opt,
      context: [ ...context, 'arguments', idx ]
    }
    const argValue = args[idx]
    const parsed = parse(argValue, nopt)
    validateArgumentTypes(func, sig, argValue, nopt)
    return {
      types: getTypes(argValue, nopt),
      raw: argValue,
      value: parsed
    }
  })
  return { fn: func, args: resolvedArgs }
}

const parse = (v, opt) => {
  const {
    model,
    fieldLimit = Object.keys(opt.model.rawAttributes),
    hydrateJSON = true,
    context = []
  } = opt
  if (v == null) return null
  if (typeof v === 'string' || typeof v === 'number') {
    return types.literal(model.sequelize.escape(v))
  }
  if (!isObject(v)) {
    throw new ValidationError({
      path: context,
      value: v,
      message: 'Must be a function, field, string, number, or object.'
    })
  }
  if (v.function) {
    const { fn, args } = getFunction(v, opt)
    return fn.execute(args, opt)
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
  if (v.val) {
    throw new ValidationError({
      path: [ ...context, 'val' ],
      value: v.val,
      message: 'Must not contain a reserved key "val".'
    })
  }
  return v
}

export default parse
