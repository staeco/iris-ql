import QueryValue from '../QueryValue'
import { ValidationError } from '../errors'

export default ({ value, direction }={}, opt) => {
  const errors = []
  let out
  const { table, context=[] } = opt
  if (!table) throw new Error('Missing table!')
  const isDirectionValid = direction === 'asc' || direction === 'desc'
  if (!value) {
    errors.push({
      path: [ ...context, 'value' ],
      value,
      message: 'Missing ordering value.'
    })
  }
  if (!direction) {
    errors.push({
      path: [ ...context, 'direction' ],
      value: direction,
      message: 'Missing ordering direction.'
    })
  }
  if (!isDirectionValid) {
    errors.push({
      path: [ ...context, 'direction' ],
      value: direction,
      message: 'Invalid ordering direction - must be asc or desc.'
    })
  }

  if (direction && value && isDirectionValid) {
    try {
      out = [
        new QueryValue(value, {
          ...opt,
          context: [ ...context, 'value' ]
        }).value(),
        direction
      ]
    } catch (err) {
      errors.push({
        path: [ ...context, 'value' ],
        value,
        message: err.message
      })
    }
  }

  if (errors.length !== 0) throw new ValidationError(errors)
  return out
}
