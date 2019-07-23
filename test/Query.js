import should from 'should'
import { Connection, Query } from '../src'
import db from './fixtures/db'

/*eslint no-console: 0, no-loops/no-loops: "off" */

describe('Query', () => {
  const conn = new Connection(db)
  const { user } = conn.tables()

  // limit
  it('should work for valid limit values', async () => {
    should.exist(new Query({ limit: 1 }, user))
    should.exist(new Query({ limit: '1' }, user))
    should.exist(new Query({ limit: '' }, user))
  })
  it('should return 400 on bad limits', async () => {
    should.throws(() => new Query({ limit: {} }, user))
    should.throws(() => new Query({ limit: 'blahblah' }, user))
  })
  it('should execute with limit', async () => {
    const query = new Query({ limit: 1 }, user)
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(3)
    res.rows.length.should.equal(1)
    should.exist(res.rows[0].authToken)
  })

  // offset
  it('should work for valid offset values', async () => {
    should.exist(new Query({ offset: 1 }, user))
    should.exist(new Query({ offset: '1' }, user))
    should.exist(new Query({ offset: '' }, user))
  })
  it('should return 400 on bad offsets', async () => {
    should.throws(() => new Query({ offset: {} }, user))
    should.throws(() => new Query({ offset: 'blahblah' }, user))
  })
  it('should execute with offset', async () => {
    const query = new Query({ offset: 1000 }, user)
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(3)
    res.rows.length.should.equal(0)
  })

  // offset
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

  // search
  it('should work for valid search values', async () => {
    should.exist(new Query({ search: '' }, user))
    should.exist(new Query({ search: 'test' }, user))
  })
  it('should return 400 on bad search', async () => {
    should.throws(() => new Query({ search: {} }, user))
    should.throws(() => new Query({ search: [ 'blah' ] }, user))
  })
  it('should execute with search', async () => {
    const query = new Query({ search: 'yo', limit: 1 }, user)
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(3)
    res.rows.length.should.equal(1)
  })
  it('should execute with search and no results', async () => {
    const query = new Query({ search: 'sdfsdfsdf' }, user)
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(0)
    res.rows.length.should.equal(0)
  })

  // before
  it('should work for valid before values', async () => {
    should.exist(new Query({ before: '' }, user))
    should.exist(new Query({ before: new Date().toISOString() }, user))
  })
  it('should return 400 on bad before', async () => {
    should.throws(() => new Query({ before: {} }, user))
    should.throws(() => new Query({ before: [ 'blah' ] }, user))
    should.throws(() => new Query({ before: 'blah' }, user))
  })
  it('should execute with before', async () => {
    const query = new Query({ before: new Date().toISOString(), limit: 1 }, user)
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(3)
    res.rows.length.should.equal(1)
  })
  it('should execute with before and no results', async () => {
    const query = new Query({ before: new Date('1/1/1975').toISOString() }, user)
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(0)
    res.rows.length.should.equal(0)
  })

  // after
  it('should work for valid after values', async () => {
    should.exist(new Query({ after: '' }, user))
    should.exist(new Query({ after: new Date().toISOString() }, user))
  })
  it('should return 400 on bad after', async () => {
    should.throws(() => new Query({ after: {} }, user))
    should.throws(() => new Query({ after: [ 'blah' ] }, user))
    should.throws(() => new Query({ after: 'blah' }, user))
  })
  it('should execute with after', async () => {
    const query = new Query({ after: new Date('1/1/1975').toISOString(), limit: 1 }, user)
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(3)
    res.rows.length.should.equal(1)
  })
  it('should execute with after and no results', async () => {
    const query = new Query({ after: new Date(Date.now() + Date.now()).toISOString() }, user)
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(0)
    res.rows.length.should.equal(0)
  })

  // scoping
  it('should execute with scope', async () => {
    const query = new Query({ limit: 1 }, user.scope('public'))
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(3)
    res.rows.length.should.equal(1)
    should.not.exist(res.rows[0].authToken)
  })

  // execution modes
  it('should execute with count off', async () => {
    const query = new Query({ limit: 1 }, user)
    const res = await query.execute({ count: false })
    should.exist(res)
    res.length.should.equal(1)
    should.exist(res[0].authToken)
  })
})
