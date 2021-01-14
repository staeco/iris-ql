import isObject from 'is-plain-obj'
import QueryValue from '../QueryValue'
import Filter from '../Filter'
import { ValidationError } from '../errors'
import aggregateWithFilter from '../util/aggregateWithFilter'

const MAX_LENGTH = 64
const MAX_NOTES_LENGTH = 1024
const alphanum = /[^0-9a-z]/i

export default (a, opt) => {
  const { model, context = [], instanceQuery } = opt
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

  if (a.name && typeof a.name !== 'string') {
    error.add({
      path: [ ...context, 'name' ],
      value: a.name,
      message: 'Must be a string.'
    })
  }

  if (a.notes && typeof a.notes !== 'string') {
    error.add({
      path: [ ...context, 'notes' ],
      value: a.notes,
      message: 'Must be a string.'
    })
  }

  if (typeof a.alias === 'string') {
    if (a.alias.length > MAX_LENGTH) error.add({ value: a.alias, path: [ ...context, 'alias' ], message: `Must be less than ${MAX_LENGTH} characters` })
    if (a.alias.match(alphanum)) error.add({ value: a.alias, path: [ ...context, 'alias' ], message: 'Must be alphanumeric' })
  }
  if (typeof a.name === 'string') {
    if (a.name.length > MAX_LENGTH) error.add({ value: a.name, path: [ ...context, 'name' ], message: `Must be less than ${MAX_LENGTH} characters` })
  }
  if (typeof a.notes === 'string') {
    if (a.notes.length > MAX_NOTES_LENGTH) error.add({ value: a.notes, path: [ ...context, 'notes' ], message: `Must be less than ${MAX_LENGTH} characters` })
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
    parsedFilters
      ? aggregateWithFilter({
        aggregation: agg,
        filters: parsedFilters,
        model,
        instanceQuery
      })
      : agg,
    a.alias
  ]
}
