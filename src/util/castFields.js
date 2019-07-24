import types from 'sequelize'
import { where, value } from './toString'
import getJSONField from './getJSONField'

export default (v, opt, table) => {
  if (Array.isArray(v)) v = { $and: v } // convert it
  if (!opt.dataType) return v // no casting required!
  const str = where({ value: v, table })
  const regex = new RegExp(`"${table.resource}"\\."(\\w*)"#>>'{(\\w*)}'`, 'g')
  const redone = str.replace(regex, (match, col, field) => {
    const lit = getJSONField(`${col}.${field}`, opt)
    return value({ value: lit, table })
  })
  return types.literal(redone)
}
