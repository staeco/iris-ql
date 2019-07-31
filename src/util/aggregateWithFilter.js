import types from 'sequelize'
import { BadRequestError } from '../errors'
import { where, value } from './toString'

export default ({ aggregation, filters, model }) => {
  if (!filters) throw new BadRequestError('Missing filters')
  if (!aggregation) throw new BadRequestError('Missing aggregation')

  const query = where({ value: filters, model })
  const agg = value({ value: aggregation, model })
  return types.literal(`${agg} FILTER (WHERE ${query})`)
}
