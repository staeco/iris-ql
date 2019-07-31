import should from 'should'
import { Query } from '../../../src'
import db from '../../fixtures/db'

describe('Query#options#search', () => {
  const { user } = db.models

  it('should work for valid search values', async () => {
    should.exist(new Query({ search: '' }, { model: user }))
    should.exist(new Query({ search: 'test' }, { model: user }))
  })
  it('should return 400 on bad search', async () => {
    should.throws(() => new Query({ search: {} }, { model: user }))
    should.throws(() => new Query({ search: [ 'blah' ] }, { model: user }))
  })
  it('should execute with search', async () => {
    const query = new Query({ search: 'yo', limit: 1 }, { model: user })
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(3)
    res.rows.length.should.equal(1)
  })
  it('should execute with search and no results', async () => {
    const query = new Query({ search: 'sdfsdfsdf' }, { model: user })
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(0)
    res.rows.length.should.equal(0)
  })
})
