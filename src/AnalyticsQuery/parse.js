import Query from '../Query'
import QueryValue from '../QueryValue'
import Aggregation from '../Aggregation'
import Join from '../Join'
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
  let attrs = [], joins

  // options becomes our initial state - then we are going to mutate from here in each phase
  let state = {
    ...opt,
    fieldLimit: opt.fieldLimit || getModelFieldLimit(model)
  }

  // if user specified time settings, tack them onto options from the query so downstream knows about it
  try {
    state = {
      ...state,
      ...parseTimeOptions(query, state)
    }
  } catch (err) {
    error.add(err)
  }

  // check joins before we dive in
  if (query.joins) {
    if (!Array.isArray(query.joins)) {
      error.add({
        path: [ ...context, 'joins' ],
        value: query.joins,
        message: 'Must be an array.'
      })
    } else {
      joins = query.joins.map((i, idx) => {
        try {
          return new Join(i, {
            ...state,
            context: [ ...context, 'joins', idx ]
          }).value()
        } catch (err) {
          error.add(err)
          return null
        }
      })
    }
  }

  // basic checks
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
          ...state,
          context: [ ...context, 'aggregations', idx ]
        }).value()
      } catch (err) {
        error.add(err)
        return null
      }
    })
  }

  if (!error.isEmpty()) throw error

  // primary query check phase
  const aggFieldLimit = query.aggregations
    .map((i) => ({ type: 'aggregation', field: i.alias, value: i.value }))

  state.fieldLimit = [ ...state.fieldLimit, ...aggFieldLimit ]
  let out = {}
  try {
    out = new Query(query, state).value()
  } catch (err) {
    error.add(err)
  }

  // groupings, last phase
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
            ...state,
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

  // post-parse checks
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
  out.joins = joins
  return out
}
