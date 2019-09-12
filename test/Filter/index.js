import should from 'should'
import { Filter } from '../../src'
import db from '../fixtures/db'
import { where } from '../../src/util/toString'

describe('Filter', () => {
  const { user, datum } = db.models
  it('should blow up on invalid options', async () => {
    should.throws(() => new Filter({ name: { $ne: null } }, { model: null }))
    should.throws(() => new Filter({ name: { $ne: null } }))
    should.throws(() => new Filter(null, { model: user }))
  })
  it('should work with basic operators', async () => {
    const query = new Filter({ name: { $ne: null } }, { model: user })
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
    } , { model: user })
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
    } , { model: user })
    should.exist(query.value())
    should.exist(query.toJSON())
    should.exist(query.input)
  })
  it('should work with mixed functions and operators', async () => {
    const query = new Filter({
      createdAt: {
        $lte: { function: 'now' }
      }
    } , { model: user })
    should.exist(query.value())
    should.exist(query.toJSON())
    should.exist(query.input)
  })
  it('should fail with unknown JSON subkeys', async () => {
    should.throws(() => new Filter({
      'data.startedAt': {
        $lte: { function: 'now' }
      }
    } , { model: datum }))
  })
  it('should work with JSON subkeys when schema provided', async () => {
    const query = new Filter({
      'data.startedAt': {
        $lte: { function: 'now' },
        $ne: null
      }
    }, {
      model: datum,
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
    should(where({ value: query.value(), model: datum })).eql(`(parse_iso("datum"."data"#>>'{startedAt}') <= now() AND "datum"."data"#>>'{startedAt}' IS NOT NULL)`)
  })
  it('should work with array JSON subkeys when schema provided', async () => {
    const query = new Filter({
      data: {
        officers: {
          $contains: [ 'W301' ]
        }
      }
    }, {
      model: datum,
      subSchemas: {
        data: {
          officers: {
            type: 'array',
            items: {
              type: 'text'
            }
          }
        }
      }
    })
    should.exist(query.value())
    should.exist(query.toJSON())
    should.exist(query.input)
    should(where({ value: query.value(), model: datum })).eql(`fix_jsonb_array("datum"."data"#>>'{officers}') @> ARRAY['W301']`)
  })
  it('should fail with invalid function usage', async () => {
    try {
      new Filter({
        function: 'gte',
        arguments: [
          { field: 'data.officers' },
          'abc'
        ]
      } , {
        model: datum,
        subSchemas: {
          data: {
            officers: {
              type: 'array',
              items: {
                type: 'text'
              }
            }
          }
        }
      })
    } catch (err) {
      should.exist(err)
      should(err.fields).eql([ {
        path: [ 'arguments', 0 ],
        value: {
          field: 'data.officers'
        },
        message: 'Argument "Value A" for "Greater Than or Equal" must be of type: number, date - instead got array'
      } ])
      return
    }
    throw new Error('Did not throw!')
  })
})
