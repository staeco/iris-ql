import should from 'should'
import { Connection, Query } from '../../src'
import db from '../fixtures/db'

describe('Query#update', () => {
  const conn = new Connection(db)
  const { user } = conn.tables()
  it('should throw on bad function', async () => {
    const query = new Query({ limit: 1 }, { table: user.scope('public') })
    should.throws(() => query.update(null))
    should.throws(() => query.update(() => null))
  })
  it('should update with new where clauses', async () => {
    const query = new Query({ limit: 1 }, { table: user.scope('public') })
    query.update((v) => ({
      ...v,
      where: [
        ...v.where,
        { createdAt: { $eq: null } }
      ]
    }))
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(0)
    res.rows.length.should.equal(0)
  })
})
