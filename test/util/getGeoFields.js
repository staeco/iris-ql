import should from 'should'
import getGeoFields from '../../src/util/getGeoFields'
import db from '../fixtures/db'

describe('util#getGeoFields', () => {
  const { user, store } = db.models

  it('should return null for a non geo table ', () => {
    const t = getGeoFields(user)
    should(t).equal(null)
  })

  it('should return location for a geo table ', () => {
    const t = getGeoFields(store)
    should(t).deepEqual([ 'location' ])
  })
})
