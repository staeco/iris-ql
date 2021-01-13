import moment from 'moment-timezone'
import sql from 'sequelize'
import { BadRequestError } from '../errors'

const zones = new Set(moment.tz.names())

export const force = (v, timezone = 'Etc/UTC') => {
  if (!zones.has(timezone)) throw new BadRequestError('Not a valid timezone')
  return sql.fn('force_tz', v, timezone)
}
