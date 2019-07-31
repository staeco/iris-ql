import isObject from 'is-pure-object'
import QueryValue from '../QueryValue'
import Filter from '../Filter'
import { ValidationError } from '../errors'
import aggregateWithFilter from '../util/aggregateWithFilter'

export default (a, opt) => {
  const { model, context=[] } = opt
  let agg, parsedFilters
  const error = new ValidationError()

  if (!isObject(a)) {
    error.add({
      path: context,
      value: a,
      message: 'Must be an object.'
    })
    throw error // dont even bother continuing
  }
  if (!a.alias) {
    error.add({
      path: [ ...context, 'alias' ],
      value: a.alias,
      message: 'Missing alias!'
    })
  } else if (typeof a.alias !== 'string') {
    error.add({
      path: [ ...context, 'alias' ],
      value: a.alias,
      message: 'Must be a string.'
    })
  }
  if (!a.value) {
    error.add({
      path: [ ...context, 'value' ],
      value: a.value,
      message: 'Missing value!'
    })
    throw error // dont even bother continuing
  }

  try {
    agg = new QueryValue(a.value, {
      ...opt,
      context: [ ...context, 'value' ]
    }).value()
  } catch (err) {
    error.add(err)
  }

  if (a.filters && !isObject(a.filters) && !Array.isArray(a.filters)) {
    error.add({
      path: [ ...context, 'filters' ],
      value: a.filters,
      message: 'Must be an object or array.'
    })
  }
  try {
    parsedFilters = a.filters && new Filter(a.filters, {
      ...opt,
      context: [ ...context, 'filters' ]
    }).value()
  } catch (err) {
    error.add(err)
  }
  if (!error.isEmpty()) throw error
  return [
    parsedFilters ? aggregateWithFilter({ aggregation: agg, filters: parsedFilters, model }) : agg,
    a.alias
  ]
}
