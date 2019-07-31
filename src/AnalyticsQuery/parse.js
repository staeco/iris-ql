import Query from '../Query'
import QueryValue from '../QueryValue'
import Aggregation from '../Aggregation'
import { ValidationError } from '../errors'
import getScopedAttributes from '../util/getScopedAttributes'

// this is an extension of parseQuery that allows for aggregations and groupings
export default (query={}, opt) => {
  const { model, context=[] } = opt
  const error = new ValidationError()
  let attrs = []
  const initialFieldLimit = opt.fieldLimit || Object.keys(getScopedAttributes(model))

  // if user specified a timezone, tack it on so downstream stuff in types/query knows about it
  if (query.timezone) {
    if (typeof query.timezone !== 'string') {
      error.add({
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
    error.add({
      path: [ ...context, 'aggregations' ],
      value: query.aggregations,
      message: 'Must be an array.'
    })
  } else {
    if (query.aggregations.length === 0) {
      error.add({
        path: [ ...context, 'aggregations' ],
        value: query.aggregations,
        message: 'Must have at least one aggregation.'
      })
    }
    attrs = query.aggregations.map((a, idx) => {
      try {
        return new Aggregation(a, {
          ...opt,
          fieldLimit: initialFieldLimit,
          context: [ ...context, 'aggregations', idx ]
        }).value()
      } catch (err) {
        error.add(err)
        return null
      }
    })
  }

  const fieldLimit = initialFieldLimit.concat(attrs.filter((i) => !!i).map((i) => i[1]))
  const nopt = { ...opt, fieldLimit }
  let out = {}
  try {
    out = new Query(query, nopt).value()
  } catch (err) {
    error.add(err)
  }
  if (query.groupings) {
    if (!Array.isArray(query.groupings)) {
      error.add({
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
          error.add(err)
          return null
        }
      })
    }
  }
  if (!error.isEmpty()) throw error

  out.attributes = attrs
  return out
}
