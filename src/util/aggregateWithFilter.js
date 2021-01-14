import sql from 'sequelize'
import { BadRequestError } from '../errors'
import { where, value } from './toString'

export default ({ aggregation, filters, model, instanceQuery }) => {
  if (!filters) throw new BadRequestError('Missing filters')
  if (!aggregation) throw new BadRequestError('Missing aggregation')

  const query = where({ value: filters, model, instanceQuery })
  const agg = value({ value: aggregation, model, instanceQuery })
  return sql.literal(`${agg} FILTER (WHERE ${query})`)
}
