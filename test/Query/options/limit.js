import should from 'should'
import { Query } from '../../../src'
import db from '../../fixtures/db'

describe('Query#options#limit', () => {
  const { user } = db.models

  it('should work for valid limit values', async () => {
    should.exist(new Query({ limit: 1 }, { model: user }))
    should.exist(new Query({ limit: '1' }, { model: user }))
    should.exist(new Query({ limit: '' }, { model: user }))
    should.exist(new Query({ limit: null }, { model: user }))
  })
  it('should return 400 on bad limits', async () => {
    should.throws(() => new Query({ limit: {} }, { model: user }))
    should.throws(() => new Query({ limit: 'blahblah' }, { model: user }))
  })
  it('should execute with limit', async () => {
    const query = new Query({ limit: 1 }, { model: user })
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(3)
    res.rows.length.should.equal(1)
    should.exist(res.rows[0].authToken)
  })
})
