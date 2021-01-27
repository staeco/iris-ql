import sql from 'sequelize'
import isObject from 'is-plain-obj'
import { ValidationError } from '../errors'
import getTypes from '../types/getTypes'
import * as funcs from '../types/functions'
import getJSONField from '../util/getJSONField'
import getJoinField from '../util/getJoinField'
import { column } from '../util/toString'
import getModelFieldLimit from '../util/getModelFieldLimit'

const resolveField = (field, subs) => {
  if (!subs) return field
  return subs?.[field] || field
}

const validateArgumentTypes = (func, sig, arg, opt) => {
  if (!sig.required && arg == null) return true // not present, so has a default
  if (sig.required && arg == null) {
    throw new ValidationError({
      path: opt.context,
      value: arg,
      message: `Argument "${sig.name}" for "${func.name}" is required`
    })
  }
  if (sig.types === 'any') return true // allows anything
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
    if (argValue == null) return null
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
    fieldLimit = getModelFieldLimit(opt.model),
    context = []
  } = opt
  if (v == null) return null
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
    return sql.literal(model.sequelize.escape(v))
  }
  if (!isObject(v)) {
    throw new ValidationError({
      path: context,
      value: v,
      message: 'Must be a string, number, boolean, or object.'
    })
  }
  if (v.function) {
    const { fn, args = [] } = getFunction(v, opt)
    try {
      return fn.execute(args, opt)
    } catch (err) {
      throw new ValidationError({
        path: context,
        value: v,
        message: err.message
      })
    }
  }
  if (v.field) {
    const resolvedField = resolveField(v.field, opt.substitutions)
    if (typeof v.field !== 'string') {
      throw new ValidationError({
        path: [ ...context, 'field' ],
        value: resolvedField,
        message: 'Must be a string.'
      })
    }
    if (resolvedField.startsWith('~')) return getJoinField(resolvedField, opt)
    if (resolvedField.includes('.')) return getJSONField(resolvedField, opt)
    if (!fieldLimit.find((i) => i.field === resolvedField)) {
      throw new ValidationError({
        path: [ ...context, 'field' ],
        value: resolvedField,
        message: 'Field does not exist.'
      })
    }
    const resolvedAggregation = fieldLimit.find((i) => i.field === resolvedField && i.type === 'aggregation')
    const resolvedColumn = fieldLimit.find((i) => i.field === resolvedField && i.type === 'column')

    // If the aggregation has the same name as a column, and the aggregation isn't just a simple alias of the column
    // it needs to be renamed to something else, or grouping/ordering has no idea if you are referencing the column
    // or the aggregation
    if (resolvedAggregation && resolvedColumn && resolvedAggregation.value?.field !== resolvedColumn.field) {
      throw new ValidationError({
        path: [ ...context, 'field' ],
        value: resolvedField,
        message: 'Field is ambigous - exists as both a column and an aggregation.'
      })
    }
    if (resolvedAggregation) return sql.col(resolvedField)
    if (resolvedColumn) return sql.literal(column({ ...opt, column: resolvedField }))

    throw new Error(`Unknown field type for: ${resolvedField}`)
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
