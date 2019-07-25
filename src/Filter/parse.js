import pgAliases from '../Connection/aliases'
import getJSONField from '../util/getJSONField'
import castFields from '../util/castFields'
import { ValidationError } from '../errors'
import isObject from 'is-pure-object'
import QueryValue from '../QueryValue'

const reserved = new Set(Object.keys(pgAliases))

const isQueryValue = (v) => v && (v.function || v.field || v.as)

export default (obj, opt) => {
  const { table, context=[], fieldLimit } = opt
  const errors = []
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
            if (fieldLimit && !fieldLimit.includes(fullPath)) {
              console.log(fieldLimit, fullPath)
              errors.push({
                path: [ ...context, 'filter' ],
                value: k,
                message: `Non-existent field: ${fullPath}`
              })
              return p
            }
          }
        }
        p[k] = transformValues(v[k], fullPath || parent)
        return p
      }, {})
    }
    return v
  }

  const transformed = transformValues(obj)

  // turn where object into string with fields casted
  if (errors.length !== 0) throw new ValidationError(errors)
  return castFields(transformed, opt, table)
}
