import should from 'should'
import { Query } from '../../src'
import db from '../fixtures/db'

describe('Query#update', () => {
  const { user } = db.models
  it('should throw on bad function', async () => {
    const query = new Query({ limit: 1 }, { model: user.scope('public') })
    should.throws(() => query.update(null))
    should.throws(() => query.update(() => null))
  })
  it('should update with new where clauses', async () => {
    const query = new Query({ limit: 1 }, { model: user.scope('public') })
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
