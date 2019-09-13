import { pickBy } from 'lodash'
import capitalize from 'capitalize'
import decamelize from 'decamelize'
import getTypes from '../types/getTypes'

const fmt = (v) => capitalize.words(decamelize(v, ' '))

export default (agg, opt={}) => {
  const types = getTypes(agg.value, opt)
  if (types.length === 0) return // no types? weird
  const primaryType = types[0]
  let fieldSchema
  if (agg.field) {
    if (agg.field.includes('.')) {
      const [ head, tail ] = agg.field.split('.')
      fieldSchema = opt.subSchemas[head][tail]
    } else {
      fieldSchema = opt.model.rawAttributes[agg.field]
    }
  }
  return pickBy({
    name: agg.name || fieldSchema?.name || fmt(agg.alias),
    notes: agg.notes || fieldSchema?.notes,
    type: primaryType.type,
    measurement: primaryType.measurement
  })
}