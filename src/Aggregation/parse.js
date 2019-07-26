import isObject from 'is-pure-object'
import QueryValue from '../QueryValue'
import Filter from '../Filter'
import { ValidationError, merge } from '../errors'
import aggregateWithFilter from '../util/aggregateWithFilter'

export default (a, opt) => {
  const { table, context=[] } = opt
  if (!table) throw new Error('Missing table!')
  const errors = []
  if (!isObject(a)) {
    errors.push({
      path: context,
      value: a,
      message: 'Must be an object.'
    })
    return null
  }
  if (!a.alias) {
    errors.push({
      path: [ ...context, 'alias' ],
      value: a.alias,
      message: 'Missing alias!'
    })
    return null
  } else if (typeof a.alias !== 'string') {
    errors.push({
      path: [ ...context, 'alias' ],
      value: a.alias,
      message: 'Must be a string.'
    })
  }
  if (!a.value) {
    errors.push({
      path: [ ...context, 'value' ],
      value: a.value,
      message: 'Missing value!'
    })
    return null
  }
  if (a.filters && !isObject(a.filters) && !Array.isArray(a.filters)) {
    errors.push({
      path: [ ...context, 'filters' ],
      value: a.filters,
      message: 'Must be an object or array.'
    })
  }

  let agg, parsedFilters
  try {
    agg = new QueryValue(a.value, {
      ...opt,
      context: [ ...context, 'value' ]
    }).value()
  } catch (err) {
    merge(errors, err)
  }
  try {
    parsedFilters = a.filters && new Filter(a.filters, {
      ...opt,
      context: [ ...context, 'filters' ]
    }).value()
  } catch (err) {
    merge(errors, err)
  }
  if (!agg) return null
  if (errors.length !== 0) throw new ValidationError(errors)
  return [
    parsedFilters ? aggregateWithFilter({ aggregation: agg, filters: parsedFilters, table }) : agg,
    a.alias
  ]
}
