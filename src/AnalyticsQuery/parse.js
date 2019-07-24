import isObject from 'is-pure-object'
import Query from './Query'
import QueryValue from './QueryValue'
import Filter from './Filter'
import { ValidationError } from '../errors'
import aggregateWithFilter from '../util/aggregateWithFilter'

// this is an extension of parseQuery that allows for aggregations and groupings
export default (query={}, opt) => {
  const { table } = opt
  if (!table) throw new Error('Missing table!')
  const errors = []
  let attrs
  const initialFieldLimit = Object.keys(table.rawAttributes)

  // if user specified a timezone, tack it on so downstream stuff in types/query knows about it
  if (query.timezone) {
    if (typeof query.timezone !== 'string') {
      errors.push({
        path: [ 'timezone' ],
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
      path: [ 'aggregations' ],
      value: query.aggregations,
      message: 'Must be an array.'
    })
  } else {
    attrs = query.aggregations.map((a, idx) => {
      if (!isObject(a)) {
        errors.push({
          path: [ 'aggregations', idx ],
          value: a,
          message: 'Must be an object.'
        })
        return null
      }
      if (!a.alias) {
        errors.push({
          path: [ 'aggregations', idx, 'alias' ],
          value: a.alias,
          message: 'Missing alias!'
        })
        return null
      } else if (typeof a.alias !== 'string') {
        errors.push({
          path: [ 'aggregations', idx, 'alias' ],
          value: a.alias,
          message: 'Must be a string.'
        })
      }
      if (!a.value) {
        errors.push({
          path: [ 'aggregations', idx, 'value' ],
          value: a.value,
          message: 'Missing value!'
        })
        return null
      }
      if (a.filters && !isObject(a.filters) && !Array.isArray(a.filters)) {
        errors.push({
          path: [ 'aggregations', idx, 'filters' ],
          value: a.filters,
          message: 'Must be an object or array.'
        })
      }

      let agg, parsedFilters
      try {
        agg = new QueryValue(a.value, opt).value()
      } catch (err) {
        errors.push({
          path: [ 'aggregations', idx, 'value' ],
          value: a.value,
          message: err.message
        })
      }
      try {
        parsedFilters = a.filters && new Filter(a.filters, opt).value()
      } catch (err) {
        errors.push({
          path: [ 'aggregations', idx, 'filters' ],
          value: a.filters,
          message: err.message
        })
      }
      if (!agg) return null
      return [
        parsedFilters ? aggregateWithFilter({ aggregation: agg, filters: parsedFilters, table }) : agg,
        a.alias
      ]
    })
  }
  if (errors.length !== 0) throw new ValidationError(errors) // bail before going further if basics failed

  const fieldLimit = initialFieldLimit.concat(attrs.map((i) => i[1]))
  const nopt = { ...opt, fieldLimit }
  const out = new Query(query, nopt).value()

  if (query.groupings) {
    if (!Array.isArray(query.groupings)) {
      errors.push({
        path: [ 'groupings' ],
        value: query.groupings,
        message: 'Must be an array.'
      })
    } else {
      out.group = query.groupings.map((i, idx) => {
        try {
          return new QueryValue(i, nopt).value()
        } catch (err) {
          errors.push({
            path: [ 'groupings', idx ],
            value: i,
            message: err.message
          })
          return null
        }
      })
    }
  }
  out.attributes = attrs

  if (errors.length !== 0) throw new ValidationError(errors)
  return out
}
