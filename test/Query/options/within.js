import should from 'should'
import { Connection, Query } from '../../../src'
import db from '../../fixtures/db'

describe('Query#options#within', () => {
  const conn = new Connection(db)
  const { store } = conn.tables()

  it('should work for valid within values', async () => {
    should.exist(new Query({ within: { xmax: 0, ymax: 0, xmin: 0, ymin: 0 } }, store))
    should.exist(new Query({ within: '' }, store))
  })
  it('should return 400 on bad within', async () => {
    should.throws(() => new Query({ within: {} }, store))
    should.throws(() => new Query({ within: 'blahblah' }, store))
    should.throws(() => new Query({ within: [ 'eee' ] }, store))
    should.throws(() => new Query({ within: [] }, store))
    should.throws(() => new Query({ within: [ '1', '2' ] }, store))
  })
  it('should execute with within', async () => {
    const bbox = {
      xmax: 90,
      ymax: 90,
      xmin: -1,
      ymin: -1
    }
    const query = new Query({ within: bbox, limit: 1 }, store)
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(3)
    res.rows.length.should.equal(1)
  })
})
