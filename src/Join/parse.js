import isObject from 'is-plain-obj'
import Query from '../Query'
import { ValidationError } from '../errors'

const MAX_LENGTH = 64
const MAX_NOTES_LENGTH = 1024
const alphanumPlus = /[^0-9a-z_-]/i

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
    if (a.alias.match(alphanumPlus)) error.add({ value: a.alias, path: [ ...context, 'alias' ], message: 'Must be alphanumeric, _, or -' })
  }
  if (typeof a.name === 'string') {
    if (a.name.length > MAX_LENGTH) error.add({ value: a.name, path: [ ...context, 'name' ], message: `Must be less than ${MAX_LENGTH} characters` })
  }
  if (typeof a.notes === 'string') {
    if (a.notes.length > MAX_NOTES_LENGTH) error.add({ value: a.notes, path: [ ...context, 'notes' ], message: `Must be less than ${MAX_LENGTH} characters` })
  }

  if (!error.isEmpty()) throw error

  const joinConfig = joins[a.alias]
  if (!joinConfig.model || !joinConfig.model.rawAttributes) throw new Error(`Missing model for join ${a.alias}!`)

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

  // check that they reference the primary somewhere in the query
  // this was originally recursing through the object to find it but it was more expensive than this basic text search
  const joinConstraint = a.filters?.find((i) =>
    JSON.stringify(i).includes(`{"field":"~parent`)
  )
  if (!joinConstraint) {
    error.add({ value: a.filters, path: [ ...context, 'filters' ], message: `Must have at least 1 filter referencing the primary data` })
  }
  if (!error.isEmpty()) throw error

  return {
    ...joinConfig,
    required: a.required,
    alias: a.alias,
    where: query.value().where
  }
}
