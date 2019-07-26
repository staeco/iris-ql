import should from 'should'
import intersects from '../../src/util/intersects'
import { Connection } from '../../src'
import db from '../fixtures/db'

describe('util#intersects', () => {
  const conn = new Connection(db)
  const { user, store } = conn.tables()

  it('should return error', () => {
    should.throws(() => intersects({}))
  })

  it('should return false when no geo fields', () => {
    const t = intersects({ type: 'Polygon', coordinates: [ 1, 2 ] }, { table: user })
    should(t.val).equal(false)
  })

  it('should return intersects', () => {
    const t = intersects({ type: 'Point', coordinates: [ 1, 2 ] }, { table: store })
    should(t.fn).equal('ST_Intersects')
    should(t.args[0].col).equal('store.location')
  })
})
