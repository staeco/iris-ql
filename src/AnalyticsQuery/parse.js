import Query from '../Query'
import QueryValue from '../QueryValue'
import Aggregation from '../Aggregation'
import { ValidationError, merge } from '../errors'

// this is an extension of parseQuery that allows for aggregations and groupings
export default (query={}, opt) => {
  const { table, context=[] } = opt
  if (!table) throw new Error('Missing table!')
  const errors = []
  let attrs
  const initialFieldLimit = Object.keys(table.rawAttributes)

  // if user specified a timezone, tack it on so downstream stuff in types/query knows about it
  if (query.timezone) {
    if (typeof query.timezone !== 'string') {
      errors.push({
        path: [ ...context, 'timezone' ],
        value: query.timezone,
        message: 'Must be a string.'
      })
    } else {
      opt.timezone = query.timezone
      delete query.timezone
    }
  }
  if (!Array.isArray(query.aggregations)) {
    errors.push({
      path: [ ...context, 'aggregations' ],
      value: query.aggregations,
      message: 'Must be an array.'
    })
  } else {
    attrs = query.aggregations.map((a, idx) => {
      try {
        return new Aggregation(a, {
          ...opt,
          context: [ ...context, 'aggregations', idx ]
        }).value()
      } catch (err) {
        merge(errors, err)
        return null
      }
    })
  }
  if (errors.length !== 0) throw new ValidationError(errors) // bail before going further if basics failed

  const fieldLimit = initialFieldLimit.concat(attrs.map((i) => i[1]))
  const nopt = { ...opt, fieldLimit }
  let out
  try {
    out = new Query(query, nopt).value()
  } catch (err) {
    merge(errors, err)
  }
  if (query.groupings) {
    if (!Array.isArray(query.groupings)) {
      errors.push({
        path: [ ...context, 'groupings' ],
        value: query.groupings,
        message: 'Must be an array.'
      })
    } else {
      out.group = query.groupings.map((i, idx) => {
        try {
          return new QueryValue(i, {
            ...nopt,
            context: [ ...context, 'groupings', idx ]
          }).value()
        } catch (err) {
          merge(errors, err)
          return null
        }
      })
    }
  }
  out.attributes = attrs

  if (errors.length !== 0) throw new ValidationError(errors)
  return out
}
