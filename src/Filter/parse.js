import operators from '../operators'
import { ValidationError } from '../errors'
import isObject from 'is-plain-obj'
import { unwrap, hydrate } from '../util/fixJSONFilters'
import isQueryValue from '../util/isQueryValue'
import QueryValue from '../QueryValue'

const reserved = new Set(Object.keys(operators))

export default (obj, opt) => {
  const { context = [] } = opt
  const error = new ValidationError()
  // recursively walk a filter object and replace query values with the real thing
  const transformValues = (v, parent = '', idx) => {
    const ctx = idx != null ? [ ...context, idx ] : context
    if (isQueryValue(v)) {
      return new QueryValue(v, {
        ...opt,
        context: ctx,
        hydrateJSON: false // we do this later anyways
      }).value()
    }
    if (Array.isArray(v)) return v.map((i, idx) => transformValues(i, parent, idx))
    if (isObject(v)) {
      return Object.keys(v).reduce((p, k) => {
        let fullPath
        // verify
        if (!reserved.has(k)) {
          fullPath = `${parent}${parent ? '.' : ''}${k}`
          try {
            new QueryValue({ field: fullPath }, {
              ...opt,
              context: ctx,
              hydrateJSON: false
            }) // performs the check, don't need the value
          } catch (err) {
            if (!err.fields) {
              error.add(err)
            } else {
              error.add(err.fields.map((e) => ({
                ...e,
                path: [ ...ctx, ...fullPath.split('.') ]
              })))
            }
            return p
          }
        }
        p[k] = transformValues(v[k], fullPath || parent, idx)
        return p
      }, {})
    }
    return v
  }

  const transformed = transformValues(obj)
  // turn where object into string with fields hydrated
  if (!error.isEmpty()) throw error

  const out = hydrate(unwrap(transformed, opt), opt)
  if (!opt.joins) return out

  // run through all of our joins and fix those up too
  return Object.entries(opt.joins).reduce((acc, [ k, v ]) =>
    hydrate(acc, { ...v, from: k !== 'parent' ? k : undefined })
  , out)
}
