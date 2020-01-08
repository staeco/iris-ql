import moment from 'moment-timezone'
import types from 'sequelize'
import { BadRequestError } from '../errors'

const zones = new Set(moment.tz.names())

export const validate = (tz) => {
  if (!zones.has(tz)) throw new BadRequestError('Not a valid timezone')
}

export default (v, { timezone } = {}) => {
  if (!timezone) return v
  if (!zones.has(timezone)) throw new BadRequestError('Not a valid timezone')
  return types.fn('force_tz', v, timezone)
}
