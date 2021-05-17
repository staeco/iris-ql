import should from 'should'
import { Query } from '../../../src'
import db from '../../fixtures/db'

describe('Query#options#before', () => {
  const { user } = db.models

  it('should work for valid before values', async () => {
    should.exist(new Query({ before: '' }, { model: user }))
    should.exist(new Query({ before: null }, { model: user }))
    should.exist(
      new Query({ before: new Date().toISOString() }, { model: user })
    )
  })
  it('should return 400 on bad before', async () => {
    should.throws(() => new Query({ before: {} }, { model: user }))
    should.throws(() => new Query({ before: ['blah'] }, { model: user }))
    should.throws(() => new Query({ before: 'blah' }, { model: user }))
  })
  it('should execute with before', async () => {
    const query = new Query(
      { before: new Date().toISOString(), limit: 1 },
      { model: user }
    )
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(3)
    res.rows.length.should.equal(1)
  })
  it('should execute with before and no results', async () => {
    const query = new Query(
      { before: new Date('1/1/1975').toISOString() },
      { model: user }
    )
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(0)
    res.rows.length.should.equal(0)
  })
})
