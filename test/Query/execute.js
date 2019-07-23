import should from 'should'
import { Connection, Query } from '../../src'
import db from '../fixtures/db'

describe('Query#execute', () => {
  const conn = new Connection(db)
  const { user } = conn.tables()
  it('should execute with count off', async () => {
    const query = new Query({ limit: 1 }, user)
    const res = await query.execute({ count: false })
    should.exist(res)
    res.length.should.equal(1)
    should.exist(res[0].authToken)
  })
  it('should execute with scope', async () => {
    const query = new Query({ limit: 1 }, user.scope('public'))
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(3)
    res.rows.length.should.equal(1)
    should.not.exist(res.rows[0].authToken)
  })
})
