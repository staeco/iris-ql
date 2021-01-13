import { ValidationError } from '../errors'
import QueryValue from '../QueryValue'

export default (v, opt) => {
  const { joins, hydrateJSON, context = [] } = opt
  const [ alias, ...rest ] = v.split('.')
  const joinKey = alias.replace('~', '')
  const joinConfig = joins?.[joinKey]
  if (!joinConfig) {
    throw new ValidationError({
      path: context,
      value: v,
      message: 'Must be a defined join!'
    })
  }

  return new QueryValue({
    field: rest.join('.')
  }, {
    ...joinConfig,
    hydrateJSON,
    context,
    instanceQuery: true,
    from: joinKey !== 'parent' ? joinKey : undefined
  }).value()
}
