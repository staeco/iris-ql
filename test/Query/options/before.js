import should from 'should'
import { Connection, Query } from '../../../src'
import db from '../../fixtures/db'

describe('Query#options#before', () => {
  const conn = new Connection(db)
  const { user } = conn.tables()

  it('should work for valid before values', async () => {
    should.exist(new Query({ before: '' }, user))
    should.exist(new Query({ before: new Date().toISOString() }, user))
  })
  it('should return 400 on bad before', async () => {
    should.throws(() => new Query({ before: {} }, user))
    should.throws(() => new Query({ before: [ 'blah' ] }, user))
    should.throws(() => new Query({ before: 'blah' }, user))
  })
  it('should execute with before', async () => {
    const query = new Query({ before: new Date().toISOString(), limit: 1 }, user)
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(3)
    res.rows.length.should.equal(1)
  })
  it('should execute with before and no results', async () => {
    const query = new Query({ before: new Date('1/1/1975').toISOString() }, user)
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(0)
    res.rows.length.should.equal(0)
  })
})
