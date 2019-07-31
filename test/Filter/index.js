import should from 'should'
import { Filter } from '../../src'
import db from '../fixtures/db'

describe('Filter', () => {
  const { user, datum } = db.models
  it('should blow up on invalid options', async () => {
    should.throws(() => new Filter({ name: { $ne: null } }, { table: null }))
    should.throws(() => new Filter({ name: { $ne: null } }))
    should.throws(() => new Filter(null, { table: user }))
  })
  it('should work with basic operators', async () => {
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
  it('should work with mixed functions and operators', async () => {
    const query = new Filter({
      createdAt: {
        $lte: { function: 'now' }
      }
    } , { table: user })
    should.exist(query.value())
    should.exist(query.toJSON())
    should.exist(query.input)
  })
  it('should fail with unknown JSON subkeys', async () => {
    should.throws(() => new Filter({
      'data.startedAt': {
        $lte: { function: 'now' }
      }
    } , { table: datum }))
  })
  it('should work with JSON subkeys when schema provided', async () => {
    const query = new Filter({
      'data.startedAt': {
        $lte: { function: 'now' }
      }
    }, {
      table: datum,
      subSchemas: {
        data: {
          startedAt: {
            type: 'date'
          }
        }
      }
    })
    should.exist(query.value())
    should.exist(query.toJSON())
    should.exist(query.input)
  })
})
