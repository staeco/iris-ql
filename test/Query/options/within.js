import should from 'should'
import { Query } from '../../../src'
import db from '../../fixtures/db'

describe('Query#options#within', () => {
  const { store } = db.models

  it('should work for valid within values', async () => {
    should.exist(new Query({ within: { xmax: 0, ymax: 0, xmin: 0, ymin: 0 } }, { model: store }))
    should.exist(new Query({ within: '' }, { model: store }))
  })
  it('should return 400 on bad within', async () => {
    should.throws(() => new Query({ within: {} }, { model: store }))
    should.throws(() => new Query({ within: 'blahblah' }, { model: store }))
    should.throws(() => new Query({ within: [ 'eee' ] }, { model: store }))
    should.throws(() => new Query({ within: [] }, { model: store }))
    should.throws(() => new Query({ within: [ '1', '2' ] }, { model: store }))
  })
  it('should execute with within', async () => {
    const bbox = {
      xmax: 180,
      ymax: 90,
      xmin: -179.999,
      ymin: -89.999
    }
    const query = new Query({ within: bbox, limit: 1 }, { model: store })
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(3)
    res.rows.length.should.equal(1)
  })
})
