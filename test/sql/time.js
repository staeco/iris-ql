import { QueryTypes } from 'sequelize'
import should from 'should'
import db from '../fixtures/db'

const select = async (q, returnSet = false, replacements) => {
  const res = await db.query(`select ${q}`, {
    type: QueryTypes.SELECT,
    plain: !returnSet,
    replacements
  })
  if (Array.isArray(res)) return res
  const keys = Object.keys(res)
  if (keys.length === 1) return res[keys[0]]
  return res
}

describe('sql#time#time_to_ms', () => {
  it('should handle a basic date', async () => {
    const now = new Date()
    should(
      await select('time_to_ms(:time)', false, {
        time: now
      })
    ).eql(now.getTime())
  })
})
