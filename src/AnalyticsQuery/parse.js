import Query from '../Query'
import QueryValue from '../QueryValue'
import Aggregation from '../Aggregation'
import { ValidationError } from '../errors'
import * as functions from '../types/functions'
import search from '../util/search'
import getModelFieldLimit from '../util/getModelFieldLimit'
import parseTimeOptions from '../util/parseTimeOptions'

const aggregateFunctions = Object.entries(functions).reduce((acc, [ k, v ]) => {
  if (v.aggregate) acc.push(k)
  return acc
}, [])

// this is an extension of parseQuery that allows for aggregations and groupings
export default (query = {}, opt) => {
  const { model, context = [] } = opt
  const error = new ValidationError()
  let attrs = []
  const initialFieldLimit = opt.fieldLimit || getModelFieldLimit(model)

  // if user specified time settins, tack them onto options from the query so downstream knows about it
  try {
    opt = {
      ...opt,
      ...parseTimeOptions(query, opt)
    }
  } catch (err) {
    error.add(err)
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

  if (!error.isEmpty()) throw error

  const aggFieldLimit = query.aggregations
    .map((i) => ({ type: 'aggregation', field: i.alias, value: i.value }))

  const fieldLimit = initialFieldLimit.concat(aggFieldLimit)
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

  // validate each aggregation and ensure it is either used in groupings, or contains an aggregate function
  query.aggregations.forEach((agg, idx) => {
    const hasAggregateFunction = search(agg.value, (k, v) => typeof v?.function === 'string' && aggregateFunctions.includes(v.function))
    if (hasAggregateFunction) return // valid
    const matchedGrouping = search(query.groupings, (k, v) => typeof v?.field === 'string' && v.field === agg.alias)
    if (matchedGrouping) return // valid
    error.add({
      path: [ ...context, 'aggregations', idx, 'value' ],
      value: agg.value,
      message: 'Must contain an aggregation.'
    })
  })

  // validate each aggregation is unique
  query.aggregations.reduce((seen, agg, idx) => {
    if (seen.includes(agg.alias)) {
      error.add({
        path: [ ...context, 'aggregations', idx, 'alias' ],
        value: agg.alias,
        message: 'Duplicate aggregation.'
      })
    } else {
      seen.push(agg.alias)
    }
    return seen
  }, [])

  if (!error.isEmpty()) throw error

  out.attributes = attrs
  return out
}
