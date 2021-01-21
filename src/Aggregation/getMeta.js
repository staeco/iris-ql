import { pickBy } from 'lodash'
import capitalize from 'capitalize'
import decamelize from 'decamelize'
import getTypes from '../types/getTypes'

const fmt = (v) => capitalize.words(decamelize(v, { separator: ' ' }))

const getFieldSchema = (field, opt) => {
  if (field.includes('.')) {
    const [ head, tail ] = field.split('.')
    return opt.subSchemas[head][tail]
  }
  return opt.model.rawAttributes[field]
}

const getJoinSchema = (field, opt) => {
  const [ join, ...rest ] = field.split('.')
  return getFieldSchema(rest.join('.'), opt.joins?.[join.replace('~', '')])
}

export default (agg, opt = {}) => {
  const types = getTypes(agg.value, opt)
  if (types.length === 0) return // no types? weird
  const primaryType = types[0]
  let fieldSchema
  if (agg.value.field) {
    fieldSchema = agg.value.field.startsWith('~')
      ? getJoinSchema(agg.value.field, opt)
      : getFieldSchema(agg.value.field, opt)
  }
  return pickBy({
    name: agg.name || fieldSchema?.name || fmt(agg.alias),
    notes: agg.notes || fieldSchema?.notes,
    type: primaryType.type,
    items: primaryType.items,
    measurement: primaryType.measurement,
    validation: primaryType.validation
  })
}
