import should from 'should'
import { Query } from '../../../src'
import db from '../../fixtures/db'

describe('Query#options#orderings', () => {
  const { user } = db.models

  it('should work for valid ordering values', async () => {
    should.exist(new Query({ orderings: [] }, { model: user }))
    should.exist(
      new Query(
        {
          orderings: [{ value: { field: 'name' }, direction: 'asc' }]
        },
        { model: user }
      )
    )
  })
  it('should return 400 on bad orderings', async () => {
    should.throws(() => new Query({ orderings: {} }, { model: user }))
    should.throws(() => new Query({ orderings: 'blahblah' }, { model: user }))
  })
  it('should execute with orderings', async () => {
    const query = new Query(
      {
        orderings: [{ value: { field: 'name' }, direction: 'desc' }]
      },
      { model: user }
    )
    const res = await query.execute()
    should(res.rows[0].name === 'Yo Yo 3')

    const query2 = new Query(
      {
        orderings: [{ value: { field: 'name' }, direction: 'asc' }]
      },
      { model: user }
    )
    const res2 = await query2.execute()
    should(res2.rows[0].name === 'Yo Yo 1')
  })
})
