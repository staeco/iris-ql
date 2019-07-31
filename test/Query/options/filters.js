import should from 'should'
import { Query } from '../../../src'
import db from '../../fixtures/db'

describe('Query#options#filters', () => {
  const { user } = db.models

  it('should work for valid filters values', async () => {
    should.exist(new Query({ filters: {} }, { model: user }))
    should.exist(new Query({ filters: { name: { $ne: null } } }, { model: user }))
  })
  it('should return 400 on bad filters', async () => {
    should.throws(() => new Query({ filters: 'blahblah' }, { model: user }))
    should.throws(() => new Query({ filters: { missing: true } }, { model: user }))
  })
  it('should execute with filters', async () => {
    const query = new Query({ filters: { name: { $eq: 'Yo Yo 1' } } }, { model: user })
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(1)
    res.rows.length.should.equal(1)
    should(res.rows[0].name === 'Yo Yo 1')
  })
})
