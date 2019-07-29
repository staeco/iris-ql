import should from 'should'
import castFields from '../../src/util/castFields'
import { Connection } from '../../src'
import db from '../fixtures/db'

describe('util#castFields', () => {
  const conn = new Connection(db)
  const { user } = conn.tables()

  it('should skip casting when no data type specified', () => {
    const t = castFields({ id: '' }, { table: user })
    should(t).eql({ id: '' })
  })

  it('should accept array of fields as input', () => {
    const t = castFields([ { id: '' } ], { table: user })
    should(t).eql({ $and: [ { id: '' } ] })
  })
})
