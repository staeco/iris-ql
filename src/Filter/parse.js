import { BadRequestError } from '../errors'
import pgAliases from '../Connection/aliases'
import getJSONField from '../util/getJSONField'
import castFields from '../util/castFields'
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
  const { table, fieldLimit } = opt
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

  return castFields(transformValues(obj), opt, table)
}
