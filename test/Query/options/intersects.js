import should from 'should'
import { Query } from '../../../src'
import db from '../../fixtures/db'

describe('Query#options#intersects', () => {
  const { store, datum } = db.models

  it('should work for valid intersects values', async () => {
    should.exist(new Query({ intersects: { x: 0, y: 0 } }, { model: store }))
    should.exist(new Query({ intersects: '' }, { model: store }))
  })
  it('should return 400 on bad intersects', async () => {
    should.throws(() => new Query({ intersects: {} }, { model: store }))
    should.throws(() => new Query({ intersects: 'blahblah' }, { model: store }))
    should.throws(() => new Query({ intersects: [ 'eee' ] }, { model: store }))
    should.throws(() => new Query({ intersects: [] }, { model: store }))
    should.throws(() => new Query({ intersects: [ '1', '2' ] }, { model: store }))
  })
  it('should execute with intersects on points', async () => {
    const point = {
      x: 5,
      y: 5
    }
    const query = new Query({ intersects: point, limit: 1 }, { model: store })
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(1)
    res.rows.length.should.equal(1)
    res.rows[0].location.coordinates.should.eql([ 5, 5 ])
  })
  it('should execute with direct intersects on lines', async () => {
    const point = {
      x: 1,
      y: 8
    }
    const query = new Query({
      intersects: point,
      filters: { sourceId: 'bike-trips' },
      limit: 1
    }, { model: datum })
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(2)
    res.rows.length.should.equal(1)
    res.rows[0].geometry.coordinates.should.eql([
      [ 1, 2 ],
      [ point.x, point.y ],
      [ 1, 12 ]
    ])
  })
  it('should execute with indirect intersects on lines', async () => {
    const point = {
      x: 1,
      y: 11
    }
    const query = new Query({
      intersects: point,
      filters: { sourceId: 'bike-trips' },
      limit: 1
    }, { model: datum })
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(2)
    res.rows.length.should.equal(1)
    res.rows[0].geometry.coordinates.should.eql([
      [ 1, 2 ],
      [ 1, 8 ],
      [ 1, 12 ]
    ])
  })
  it('should validate coordinate max', async () => {
    const point = {
      x: 1000,
      y: 1000
    }
    try {
      new Query({ intersects: point, limit: 1 }, { model: store })
    } catch (err) {
      err.fields.should.eql([
        {
          message: 'Longitude greater than 180',
          path: [
            'intersects',
            'x'
          ],
          value: 1000
        },
        {
          message: 'Latitude greater than 90',
          path: [
            'intersects',
            'y'
          ],
          value: 1000
        } ])
    }
  })
  it('should validate coordinate min', async () => {
    const point = {
      x: -1000,
      y: -1000
    }
    try {
      new Query({ intersects: point, limit: 1 }, { model: store })
    } catch (err) {
      err.fields.should.eql([
        {
          message: 'Longitude less than -180',
          path: [
            'intersects',
            'x'
          ],
          value: -1000
        },
        {
          message: 'Latitude less than -90',
          path: [
            'intersects',
            'y'
          ],
          value: -1000
        } ])
    }
  })
})
