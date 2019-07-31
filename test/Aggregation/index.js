import should from 'should'
import { Aggregation } from '../../src'
import db from '../fixtures/db'

describe('Aggregation', () => {
  const { user } = db.models
  it('should blow up on invalid options', async () => {
    should.throws(() => new Aggregation({ value: { field: 'name' }, alias: 'name' }, { table: null }))
    should.throws(() => new Aggregation({ value: { field: 'name' }, alias: 'name' }))
    should.throws(() => new Aggregation(null, { table: user }))
    should.throws(() => new Aggregation(true, { table: user }))
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
  it('should blow up when missing alias', async () => {
    try {
      new Aggregation({ value: { field: 'name' }, alias: null }, { table: user })
    } catch (err) {
      err.fields.should.eql([ { path: [ 'alias' ], value: null, message: 'Missing alias!' } ])
      return
    }
    throw new Error('Did not throw!')
  })
  it('should blow up when alias value invalid', async () => {
    try {
      new Aggregation({ value: { field: 'name' }, alias: true }, { table: user })
    } catch (err) {
      err.fields.should.eql([ { path: [ 'alias' ], value: true, message: 'Must be a string.' } ])
      return
    }
    throw new Error('Did not throw!')
  })
  it('should blow up when missing value', async () => {
    try {
      new Aggregation({ value: null, alias: 'name' }, { table: user })
    } catch (err) {
      err.fields.should.eql([ { path: [ 'value' ], value: null, message: 'Missing value!' } ])
      return
    }
    throw new Error('Did not throw!')
  })
  it('should blow up when filters value invalid', async () => {
    try {
      new Aggregation({ value: { field: 'name' }, filters: true, alias: 'name' }, { table: user })
    } catch (err) {
      err.fields.should.eql([ { path: [ 'filters' ], value: true, message: 'Must be an object or array.' } ])
      return
    }
    throw new Error('Did not throw!')
  })
  it('should blow up when filters has a bad value', async () => {
    try {
      new Aggregation({ value: { field: 'name' }, filters: { doesNotExist: { $eq: true } }, alias: 'name' }, { table: user })
    } catch (err) {
      err.fields.should.eql([ { path: [ 'filters', 'doesNotExist' ], value: 'doesNotExist', message: 'Field does not exist.' } ])
      return
    }
    throw new Error('Did not throw!')
  })
})
