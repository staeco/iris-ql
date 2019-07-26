import should from 'should'
import { Connection, Aggregation } from '../../src'
import db from '../fixtures/db'

describe('Aggregation', () => {
  const conn = new Connection(db)
  const { user } = conn.tables()
  it('should blow up on invalid options', async () => {
    should.throws(() => new Aggregation({ value: { field: 'name' }, alias: 'name' }, { table: null }))
    should.throws(() => new Aggregation({ value: { field: 'name' }, alias: 'name' }))
    should.throws(() => new Aggregation(null, { table: user }))
  })
  it('should work with basic value', async () => {
    const query = new Aggregation({ value: { field: 'name' }, alias: 'name' }, { table: user })
    should.exist(query.value())
    should.exist(query.toJSON())
    should.exist(query.input)
  })
  it('should work with functions', async () => {
    const query = new Aggregation({
      value: { function: 'now' },
      alias: 'now'
    }, { table: user })
    should.exist(query.value())
    should.exist(query.toJSON())
    should.exist(query.input)
  })
  it('should work with basic value and filters', async () => {
    const query = new Aggregation({
      value: { field: 'name' },
      alias: 'name',
      filters: {
        name: { $eq: 'Yo' }
      }
    }, { table: user })
    should.exist(query.value())
    should.exist(query.toJSON())
    should.exist(query.input)
  })
})
