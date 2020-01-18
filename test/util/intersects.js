import should from 'should'
import intersects from '../../src/util/intersects'
import db from '../fixtures/db'

describe('util#intersects', () => {
  const { user, store } = db.models

  it('should return error', () => {
    should.throws(() => intersects({}))
  })

  it('should return false when no geo fields', () => {
    const t = intersects({ type: 'Polygon', coordinates: [ 1, 2 ] }, { model: user })
    should(t.val).equal(false)
  })

  it('should return intersects', () => {
    const t = intersects({ type: 'Point', coordinates: [ 1, 2 ] }, { model: store })
    should(t.fn).equal('ST_Intersects')
    should.exist(t.args[0])
  })
})
