import should from 'should'
import { Connection, Query } from '../../../src'
import db from '../../fixtures/db'

describe('Query#options#search', () => {
  const conn = new Connection(db)
  const { user } = conn.tables()

  it('should work for valid search values', async () => {
    should.exist(new Query({ search: '' }, user))
    should.exist(new Query({ search: 'test' }, user))
  })
  it('should return 400 on bad search', async () => {
    should.throws(() => new Query({ search: {} }, user))
    should.throws(() => new Query({ search: [ 'blah' ] }, user))
  })
  it('should execute with search', async () => {
    const query = new Query({ search: 'yo', limit: 1 }, user)
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(3)
    res.rows.length.should.equal(1)
  })
  it('should execute with search and no results', async () => {
    const query = new Query({ search: 'sdfsdfsdf' }, user)
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(0)
    res.rows.length.should.equal(0)
  })
})
