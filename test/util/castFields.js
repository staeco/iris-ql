import should from 'should'
import hydrateFields from '../../src/util/hydrateFields'
import db from '../fixtures/db'

describe('util#hydrateFields', () => {
  const { user } = db.models

  it('should skip hydrating when no data type specified', () => {
    const t = hydrateFields({ id: '' }, { model: user })
    should(t).eql({ id: '' })
  })

  it('should accept array of fields as input', () => {
    const t = hydrateFields([ { id: '' } ], { model: user })
    should(t).eql({ $and: [ { id: '' } ] })
  })
})
