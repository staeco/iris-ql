import should from 'should'
import { Query } from '../../../src'
import db from '../../fixtures/db'

describe('Query#options#after', () => {
  const { user } = db.models

  it('should work for valid after values', async () => {
    should.exist(new Query({ after: '' }, { model: user }))
    should.exist(new Query({ after: null }, { model: user }))
    should.exist(new Query({ after: new Date().toISOString() }, { model: user }))
  })
  it('should return 400 on bad after', async () => {
    should.throws(() => new Query({ after: {} }, { model: user }))
    should.throws(() => new Query({ after: [ 'blah' ] }, { model: user }))
    should.throws(() => new Query({ after: 'blah' }, { model: user }))
  })
  it('should execute with after', async () => {
    const query = new Query({ after: new Date('1/1/1975').toISOString(), limit: 1 }, { model: user })
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(3)
    res.rows.length.should.equal(1)
  })
  it('should execute with after and no results', async () => {
    const query = new Query({ after: new Date(Date.now() + Date.now()).toISOString() }, { model: user })
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(0)
    res.rows.length.should.equal(0)
  })
})
