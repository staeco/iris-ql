import should from 'should'
import { Query } from '../../../src'
import db from '../../fixtures/db'

describe('Query#options#intersects', () => {
  const { store } = db.models

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
  it('should validate coordinate max', async () => {
    const point = {
      x: 1000,
      y: 1000
    }
    try {
      new Query({ intersects: point, limit: 1 }, { table: store })
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
      new Query({ intersects: point, limit: 1 }, { table: store })
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
