import should from 'should'
import { Connection, Filter } from '../../src'
import db from '../fixtures/db'

describe('Filter', () => {
  const conn = new Connection(db)
  const { user } = conn.tables()
  it('should export the correct api', async () => {
    const query = new Filter({ name: { $ne: null } }, { table: user })
    should.exist(query.value())
    should.exist(query.toJSON())
    should.exist(query.input)
  })
})
