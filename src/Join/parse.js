import isObject from 'is-plain-obj'
import Query from '../Query'
import { ValidationError } from '../errors'

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

  const joinConfig = joins[a.alias]
  try {
    new Query(a, {
      context,
      fieldLimit: joinConfig.fieldLimit,
      model: joinConfig.model,
      subSchemas: joinConfig.subSchemas
    })
  } catch (err) {
    error.add(err)
  }

  if (!error.isEmpty()) throw error
  return null // TODO: what does this return?
}
