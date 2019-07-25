import should from 'should'
import { Connection, Query } from '../../../src'
import db from '../../fixtures/db'

describe('Query#options#limit', () => {
  const conn = new Connection(db)
  const { user } = conn.tables()

  it('should work for valid limit values', async () => {
    should.exist(new Query({ limit: 1 }, { table: user }))
    should.exist(new Query({ limit: '1' }, { table: user }))
    should.exist(new Query({ limit: '' }, { table: user }))
  })
  it('should return 400 on bad limits', async () => {
    should.throws(() => new Query({ limit: {} }, { table: user }))
    should.throws(() => new Query({ limit: 'blahblah' }, { table: user }))
  })
  it('should execute with limit', async () => {
    const query = new Query({ limit: 1 }, { table: user })
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(3)
    res.rows.length.should.equal(1)
    should.exist(res.rows[0].authToken)
  })
})
