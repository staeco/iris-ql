import sql from 'sequelize'
import { where, value, identifier } from './toString'
import getJSONField from './getJSONField'

const jsonField = /"(\w*)"\."(\w*)"#>>'{(\w*)}'/

// sometimes sequelize randomly wraps json access in useless parens, so unwrap everything
const wrapped = /\("(\w*)"\."(\w*)"#>>'{(\w*)}'\)/g
export const unwrap = (v, opt) => {
  if (Array.isArray(v)) v = { $and: v } // convert it
  const str = where({ ...opt, value: v })
  if (!jsonField.test(str)) return v // nothing to do! no fields to hydrate
  const redone = str.replace(wrapped, (match, table, col, field) => `"${table}"."${col}"#>>'{${field}}'`)
  return sql.literal(redone)
}

export const hydrate = (v, opt) => {
  if (Array.isArray(v)) v = { $and: v } // convert it
  const str = where({ ...opt, value: v })
  if (!jsonField.test(str)) return v // nothing to do! no fields to hydrate

  const fixing = identifier({ ...opt, value: opt.from || opt.model.name })

  // if the field is followed by " IS" then skip, because we dont need to hydrate that
  // since its either IS NULL or IS NOT NULL
  const needsCasting = new RegExp(`${fixing}\\."(\\w*)"#>>'{(\\w*)}'(?! (IS NULL|IS NOT NULL))`, 'g')
  const redone = str.replace(needsCasting, (match, col, field) => {
    const lit = getJSONField(`${col}.${field}`, opt)
    return value({ ...opt, value: lit })
  })
  return sql.literal(redone)
}
