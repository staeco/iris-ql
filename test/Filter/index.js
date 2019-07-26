import should from 'should'
import { Connection, Filter } from '../../src'
import db from '../fixtures/db'

describe('Filter', () => {
  const conn = new Connection(db)
  const { user } = conn.tables()
  it('should work with basic aliases', async () => {
    const query = new Filter({ name: { $ne: null } }, { table: user })
    should.exist(query.value())
    should.exist(query.toJSON())
    should.exist(query.input)
  })
  it('should work with functions', async () => {
    const query = new Filter({
      function: 'gte',
      arguments: [
        3, 1
      ]
    } , { table: user })
    should.exist(query.value())
    should.exist(query.toJSON())
    should.exist(query.input)
  })
  it('should work with nested functions', async () => {
    const query = new Filter({
      function: 'gte',
      arguments: [
        3,
        { function: 'now' }
      ]
    } , { table: user })
    should.exist(query.value())
    should.exist(query.toJSON())
    should.exist(query.input)
  })
  it('should work with mixed functions and aliases', async () => {
    const query = new Filter({
      createdAt: {
        $lte: { function: 'now' }
      }
    } , { table: user })
    should.exist(query.value())
    should.exist(query.toJSON())
    should.exist(query.input)
  })
})
