import operators from '../operators'
import getJSONField from '../util/getJSONField'
import hydrateFields from '../util/hydrateFields'
import { ValidationError } from '../errors'
import isObject from 'is-plain-obj'
import isQueryValue from '../util/isQueryValue'
import getModelFieldLimit from '../util/getModelFieldLimit'
import QueryValue from '../QueryValue'

const reserved = new Set(Object.keys(operators))

export default (obj, opt) => {
  const {
    model,
    context = [],
    fieldLimit = getModelFieldLimit(model)
  } = opt
  const error = new ValidationError()
  // recursively walk a filter object and replace query values with the real thing
  const transformValues = (v, parent = '') => {
    if (isQueryValue(v)) return new QueryValue(v, { ...opt, hydrateJSON: false }).value() // keep it raw, we hydrate it all later
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
            if (!fieldLimit.find((i) => i.field === fullPath)) {
              error.add({
                path: [ ...context, ...fullPath.split('.') ],
                value: k,
                message: 'Field does not exist.'
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

  // turn where object into string with fields hydrateed
  if (!error.isEmpty()) throw error
  return hydrateFields(transformed, opt)
}
