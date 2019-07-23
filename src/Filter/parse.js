import types from 'connections/postgres'
import { BadRequestError } from 'sutro/dist/errors'
import pgAliases from 'connections/postgres/aliases'
import { where, value } from '../util/toString'
import getJSONField from '../util/getJSONField'
import QueryValue from '../QueryValue'

const reserved = new Set(Object.keys(pgAliases))

const isObject = (x) =>
  typeof x === 'object'
  && x !== null
  && !(x instanceof RegExp)
  && !(x instanceof Error)
  && !(x instanceof Date)

const isQueryValue = (v) => v && (v.function || v.field || v.as)

export default (obj, opt) => {
  const { dataType, table, fieldLimit } = opt
  // recursively walk a filter object and replace query values with the real thing
  const transformValues = (v, parent='') => {
    if (isQueryValue(v)) return new QueryValue(v, { ...opt, castJSON: false }).value() // keep it raw, we cast it all later
    if (Array.isArray(v)) return v.map((i) => transformValues(i, parent))
    if (isObject(v)) {
      return Object.keys(v).reduce((p, k) => {
        let fullPath
        // verify
        if (!reserved.has(k)) {
          fullPath = `${parent}${parent ? '.' : ''}${k}`
          if (fullPath.includes('.')) {
            getJSONField(fullPath, opt) // performs the check, don't need the value
          } else {
            if (fieldLimit && !fieldLimit.includes(fullPath)) throw new BadRequestError(`Non-existent field: ${fullPath}`)
          }
        }
        p[k] = transformValues(v[k], fullPath || parent)
        return p
      }, {})
    }
    return v
  }
  // turn where object into string with fields casted
  const castFields = (v) => {
    if (Array.isArray(v)) v = { $and: v } // convert it
    if (!dataType) return v // no casting required!
    const str = where({ value: v, table })
    const regex = new RegExp(`"${table.resource}"\\."(\\w*)"#>>'{(\\w*)}'`, 'g')
    const redone = str.replace(regex, (match, col, field) => {
      const lit = getJSONField(`${col}.${field}`, opt)
      return value({ value: lit, table })
    })
    return types.literal(redone)
  }

  return castFields(transformValues(obj))
}
