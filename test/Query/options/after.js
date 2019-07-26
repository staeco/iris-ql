import should from 'should'
import { Connection, Query } from '../../../src'
import db from '../../fixtures/db'

describe('Query#options#after', () => {
  const conn = new Connection(db)
  const { user } = conn.tables()

  it('should work for valid after values', async () => {
    should.exist(new Query({ after: '' }, { table: user }))
    should.exist(new Query({ after: null }, { table: user }))
    should.exist(new Query({ after: new Date().toISOString() }, { table: user }))
  })
  it('should return 400 on bad after', async () => {
    should.throws(() => new Query({ after: {} }, { table: user }))
    should.throws(() => new Query({ after: [ 'blah' ] }, { table: user }))
    should.throws(() => new Query({ after: 'blah' }, { table: user }))
  })
  it('should execute with after', async () => {
    const query = new Query({ after: new Date('1/1/1975').toISOString(), limit: 1 }, { table: user })
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(3)
    res.rows.length.should.equal(1)
  })
  it('should execute with after and no results', async () => {
    const query = new Query({ after: new Date(Date.now() + Date.now()).toISOString() }, { table: user })
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(0)
    res.rows.length.should.equal(0)
  })
})
