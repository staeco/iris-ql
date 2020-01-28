import should from 'should'
import { Query } from '../../../src'
import db from '../../fixtures/db'

describe('Query#options#exclusions', () => {
  const { user } = db.models

  it('should work for valid exclusions values', async () => {
    should.exist(new Query({ exclusions: [] }, { model: user }))
    should.exist(new Query({ exclusions: [ 'id' ] }, { model: user }))
    should.exist(new Query({ exclusions: '' }, { model: user }))
    should.exist(new Query({ exclusions: null }, { model: user }))
    should.exist(new Query({ exclusions: 'id,name' }, { model: user }))
  })
  it('should return 400 on bad exclusions', async () => {
    should.throws(() => new Query({ exclusions: {} }, { model: user }))
    should.throws(() => new Query({ exclusions: 'blahblah' }, { model: user }))
    should.throws(() => new Query({ exclusions: [ 'field-does-not-exist' ] }, { model: user }))
  })
  it('should execute with exclusions', async () => {
    const query = new Query({ exclusions: [ 'id' ], limit: 1 }, { model: user })
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(3)
    res.rows.length.should.equal(1)
    should.not.exist(res.rows[0].id)
  })
  it.skip('should execute with nested exclusions', async () => {
    const query = new Query({ exclusions: [ 'settings.vegan' ], limit: 1 }, { model: user })
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(3)
    res.rows.length.should.equal(1)
    should.not.exist(res.rows[0].settings.vegan)
    should.exist(res.rows[0].settings.glutenAllergy)
  })
})
