import isObject from 'is-plain-obj'
import Query from '../Query'
import { ValidationError } from '../errors'
import { join } from '../util/toString'

export default (a, opt) => {
  const { joins, context = [] } = opt
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
  } else if (!joins[a.alias]) {
    error.add({
      path: [ ...context, 'alias' ],
      value: a.alias,
      message: 'Must be a defined join!'
    })
  }

  if (!error.isEmpty()) throw error

  const joinConfig = joins[a.alias]
  let query
  try {
    query = new Query(a, {
      context,
      ...joinConfig,
      from: a.alias,
      joins: {
        parent: {
          fieldLimit: opt.fieldLimit,
          model: opt.model,
          subSchemas: opt.subSchemas
        }
      }
    })
  } catch (err) {
    error.add(err)
  }

  if (!error.isEmpty()) throw error

  return {
    ...joinConfig,
    alias: a.alias,
    value: query.value()
  }
}
