import should from 'should'
import { Connection, Query } from '../../../src'
import db from '../../fixtures/db'

describe('Query#options#offset', () => {
  const conn = new Connection(db)
  const { user } = conn.tables()

  it('should work for valid offset values', async () => {
    should.exist(new Query({ offset: 1 }, user))
    should.exist(new Query({ offset: '1' }, user))
    should.exist(new Query({ offset: '' }, user))
  })
  it('should return 400 on bad offsets', async () => {
    should.throws(() => new Query({ offset: {} }, user))
    should.throws(() => new Query({ offset: 'blahblah' }, user))
  })
  it('should execute with offset', async () => {
    const query = new Query({ offset: 1000 }, user)
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(3)
    res.rows.length.should.equal(0)
  })
})
