import types from 'sequelize'
import { where, value } from './toString'
import getJSONField from './getJSONField'

export default (v, opt) => {
  if (Array.isArray(v)) v = { $and: v } // convert it
  const str = where({ value: v, model: opt.model })
  const regex = new RegExp(`"${opt.model.name}"\\."(\\w*)"#>>'{(\\w*)}'`, 'g')
  if (!regex.test(str)) return v // no work needed, keep the same value
  const redone = str.replace(regex, (match, col, field) => {
    const lit = getJSONField(`${col}.${field}`, opt)
    return value({ value: lit, model: opt.model })
  })
  return types.literal(redone)
}
