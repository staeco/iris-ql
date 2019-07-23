import types from 'sequelize'
import { BadRequestError } from '../errors'
import { where, value } from './toString'

export default ({ aggregation, filters, table }) => {
  if (!filters) throw new BadRequestError('Missing filters')
  if (!aggregation) throw new BadRequestError('Missing aggregation')

  const query = where({ value: filters, table })
  const agg = value({ value: aggregation, table })
  return types.literal(`${agg} FILTER (WHERE ${query})`)
}
