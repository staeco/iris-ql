import types from 'sequelize'
import { BadRequestError } from '../errors'
import * as funcs from '../functions'
import getJSONField from '../util/getJSONField'

const baseParse = (v, opt) => {
  const { fieldLimit, castJSON = true } = opt
  if (v == null) return null
  if (v.function) {
    if (typeof v.function !== 'string') throw new BadRequestError('Invalid function name')
    const func = funcs[v.function]
    const args = v.arguments || []
    if (!func) throw new BadRequestError(`Invalid function name - ${v.function}`)
    if (!Array.isArray(args)) throw new BadRequestError(`Invalid function arguments for ${v.function}`)
    return func(...args.map((i) => parse(i, opt)))
  }
  if (v.field) {
    if (typeof v.field !== 'string') throw new BadRequestError('Invalid field name')
    if (v.field.includes('.')) return getJSONField(v.field, { ...opt, cast: castJSON })
    if (fieldLimit && !fieldLimit.includes(v.field)) throw new BadRequestError(`Non-existent field: ${v.field}`)
    return types.col(v.field)
  }
  if (typeof v === 'string') {
    const slit = types.literal(types.escape(v))
    slit.raw = v // expose raw value so functions can optionally take this as an argument
    return slit
  }
  if (typeof v === 'object') throw new BadRequestError('Query object given was invalid')
  return v
}

const parse = (v, ...rest) => {
  const ret = baseParse(v, ...rest)
  if (!v.as) return ret
  if (typeof v.as !== 'string') throw new BadRequestError('as value given was invalid')
  return types.cast(ret, v.as)
}

export default parse
