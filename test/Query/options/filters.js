import should from 'should'
import { Connection, Query } from '../../../src'
import db from '../../fixtures/db'

describe('Query#options#filters', () => {
  const conn = new Connection(db)
  const { user } = conn.tables()

  it('should work for valid filters values', async () => {
    should.exist(new Query({ filters: {} }, { table: user }))
    should.exist(new Query({ filters: { name: { $ne: null } } }, { table: user }))
  })
  it('should return 400 on bad filters', async () => {
    should.throws(() => new Query({ filters: 'blahblah' }, { table: user }))
  })
  it('should execute with filters', async () => {
    const query = new Query({ filters: { name: { $eq: 'Yo Yo 1' } } }, { table: user })
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(1)
    res.rows.length.should.equal(1)
    should(res.rows[0].name === 'Yo Yo 1')
  })
})