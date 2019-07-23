import should from 'should'
import { Connection, Query } from '../../../src'
import db from '../../fixtures/db'

describe('Query#options#exclusions', () => {
  const conn = new Connection(db)
  const { user } = conn.tables()

  it('should work for valid exclusions values', async () => {
    should.exist(new Query({ exclusions: [] }, user))
    should.exist(new Query({ exclusions: [ 'id' ] }, user))
    should.exist(new Query({ exclusions: '' }, user))
  })
  it('should return 400 on bad exclusions', async () => {
    should.throws(() => new Query({ exclusions: {} }, user))
    should.throws(() => new Query({ exclusions: 'blahblah' }, user))
    should.throws(() => new Query({ exclusions: [ 'field-does-not-exist' ] }, user))
  })
  it('should execute with exclusions', async () => {
    const query = new Query({ exclusions: [ 'id' ], limit: 1 }, user)
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(3)
    res.rows.length.should.equal(1)
    should.not.exist(res.rows[0].id)
  })
})
