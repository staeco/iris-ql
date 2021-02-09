import { ValidationError } from '../errors'
import QueryValue from '../QueryValue'

export const parse = (v) => {
  const [ alias, ...rest ] = v.split('.')
  const joinKey = alias.replace('~', '')
  return { alias: joinKey, field: rest.join('.') }
}

export default (v, opt) => {
  const { joins, hydrateJSON, context = [] } = opt
  const { alias, field } = parse(v)
  const joinKey = alias.replace('~', '')
  const joinConfig = joins?.[joinKey]
  if (!joinConfig) {
    throw new ValidationError({
      path: context,
      value: v,
      message: 'Must be a defined join!'
    })
  }

  return new QueryValue({ field }, {
    ...joinConfig,
    hydrateJSON,
    context,
    instanceQuery: true,
    from: joinKey !== 'parent' ? joinKey : undefined
  }).value()
}
