import should from 'should'
import { Query } from '../../../src'
import db from '../../fixtures/db'

describe('Query#options#offset', () => {
  const { user } = db.models

  it('should work for valid offset values', async () => {
    should.exist(new Query({ offset: 1 }, { table: user }))
    should.exist(new Query({ offset: '1' }, { table: user }))
    should.exist(new Query({ offset: '' }, { table: user }))
  })
  it('should return 400 on bad offsets', async () => {
    should.throws(() => new Query({ offset: {} }, { table: user }))
    should.throws(() => new Query({ offset: 'blahblah' }, { table: user }))
  })
  it('should execute with offset', async () => {
    const query = new Query({ offset: 1000 }, { table: user })
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(3)
    res.rows.length.should.equal(0)
  })
})
