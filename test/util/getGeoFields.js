import should from 'should'
import getGeoFields from '../../src/util/getGeoFields'
import { Connection } from '../../src'
import db from '../fixtures/db'

describe('util#getGeoFields', () => {
  const conn = new Connection(db)
  const { user, store } = conn.tables()

  it('should return null for a non geo table ', () => {
    const t = getGeoFields(user)
    should(t).equal(null)
  })

  it('should return location for a geo table ', () => {
    const t = getGeoFields(store)
    should(t).deepEqual([ 'location' ])
  })
})
