import QueryValue from '../QueryValue'
import { ValidationError } from '../errors'

export default ({ value, direction } = {}, opt) => {
  const error = new ValidationError()
  let out
  const { context = [] } = opt
  const isDirectionValid = direction === 'asc' || direction === 'desc'
  if (!value) {
    error.add({
      path: [...context, 'value'],
      value,
      message: 'Missing ordering value.'
    })
  }
  if (!direction) {
    error.add({
      path: [...context, 'direction'],
      value: direction,
      message: 'Missing ordering direction.'
    })
  }
  if (direction != null && !isDirectionValid) {
    error.add({
      path: [...context, 'direction'],
      value: direction,
      message: 'Invalid ordering direction - must be asc or desc.'
    })
  }

  if (direction && value && isDirectionValid) {
    try {
      out = [
        new QueryValue(value, {
          ...opt,
          context: [...context, 'value']
        }).value(),
        direction
      ]
    } catch (err) {
      error.add(err)
    }
  }

  if (!error.isEmpty()) throw error
  return out
}
