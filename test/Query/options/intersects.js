import should from 'should'
import { Connection, Query } from '../../../src'
import db from '../../fixtures/db'

describe('Query#options#intersects', () => {
  const conn = new Connection(db)
  const { store } = conn.tables()

  it('should work for valid intersects values', async () => {
    should.exist(new Query({ intersects: { x: 0, y: 0 } }, { table: store }))
    should.exist(new Query({ intersects: '' }, { table: store }))
  })
  it('should return 400 on bad intersects', async () => {
    should.throws(() => new Query({ intersects: {} }, { table: store }))
    should.throws(() => new Query({ intersects: 'blahblah' }, { table: store }))
    should.throws(() => new Query({ intersects: [ 'eee' ] }, { table: store }))
    should.throws(() => new Query({ intersects: [] }, { table: store }))
    should.throws(() => new Query({ intersects: [ '1', '2' ] }, { table: store }))
  })
  it('should execute with intersects', async () => {
    const point = {
      x: 5,
      y: 5
    }
    const query = new Query({ intersects: point, limit: 1 }, { table: store })
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(1)
    res.rows.length.should.equal(1)
    res.rows[0].location.coordinates.should.eql([ 5, 5 ])
  })
})
