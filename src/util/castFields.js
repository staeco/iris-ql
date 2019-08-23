import types from 'sequelize'
import { where, value } from './toString'
import getJSONField from './getJSONField'

const jsonField = /"(\w*)"\."(\w*)"#>>'{(\w*)}'/

// sometimes sequelize randomly wraps json access in useless parens, so unwrap everything
const wrapped = /\("(\w*)"\."(\w*)"#>>'{(\w*)}'\)/g
const unwrap = (str) =>
  str.replace(wrapped, (match, table, col, field) => `"${table}"."${col}"#>>'{${field}}'`)

export default (v, opt) => {
  if (Array.isArray(v)) v = { $and: v } // convert it
  const str = where({ value: v, model: opt.model })
  console.log(str, jsonField.test(str))
  if (!jsonField.test(str)) return v // nothing to do! no fields to cast

  // if the field is followed by " IS" then skip, because we dont need to cast that
  // since its either IS NULL or IS NOT NULL
  const needsCasting = new RegExp(`"${opt.model.name}"\\."(\\w*)"#>>'{(\\w*)}'(?! (IS NULL|IS NOT NULL))`, 'g')
  const redone = unwrap(str).replace(needsCasting, (match, col, field) => {
    const lit = getJSONField(`${col}.${field}`, opt)
    return value({ value: lit, model: opt.model })
  })
  return types.literal(redone)
}
