// TODO: more tests

import should from 'should'
import { hydrate } from '../../src/util/fixJSONFilters'
import db from '../fixtures/db'

describe('util#fixJSONFilters#hydrate', () => {
  const { user } = db.models

  it('should skip hydrating when no data type specified', () => {
    const t = hydrate({ id: '' }, { model: user })
    should(t).eql({ id: '' })
  })

  it('should accept array of fields as input', () => {
    const t = hydrate([ { id: '' } ], { model: user })
    should(t).eql({ $and: [ { id: '' } ] })
  })
})
