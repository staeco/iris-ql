import should from 'should'
import { Connection, Query } from '../../../src'
import db from '../../fixtures/db'

describe('Query#options#orderings', () => {
  const conn = new Connection(db)
  const { user } = conn.tables()

  it('should work for valid ordering values', async () => {
    should.exist(new Query({ orderings: [] }, user))
    should.exist(new Query({
      orderings: [
        { value: { field: 'name' }, direction: 'asc' }
      ]
    }, user))
  })
  it('should return 400 on bad orderings', async () => {
    should.throws(() => new Query({ orderings: {} }, user))
    should.throws(() => new Query({ orderings: 'blahblah' }, user))
  })
  it('should execute with orderings', async () => {
    const query = new Query({
      orderings: [
        { value: { field: 'name' }, direction: 'desc' }
      ]
    }, user)
    const res = await query.execute()
    should(res.rows[0].name === 'Yo Yo 3')

    const query2 = new Query({
      orderings: [
        { value: { field: 'name' }, direction: 'asc' }
      ]
    }, user)
    const res2 = await query2.execute()
    should(res2.rows[0].name === 'Yo Yo 1')
  })
})
