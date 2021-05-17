import should from 'should'
import { Aggregation } from '../../src'
import db from '../fixtures/db'

describe('Aggregation', () => {
  const { user } = db.models
  it('should blow up on invalid options', async () => {
    should.throws(
      () =>
        new Aggregation(
          { value: { field: 'name' }, alias: 'name' },
          { model: null }
        )
    )
    should.throws(
      () => new Aggregation({ value: { field: 'name' }, alias: 'name' })
    )
    should.throws(() => new Aggregation(null, { model: user }))
    should.throws(() => new Aggregation(true, { model: user }))
  })
  it('should work with basic value', async () => {
    const query = new Aggregation(
      { value: { field: 'name' }, alias: 'name' },
      { model: user }
    )
    should.exist(query.value())
    should.exist(query.toJSON())
    should.exist(query.input)
  })
  it('should work with functions', async () => {
    const query = new Aggregation(
      {
        value: { function: 'now' },
        alias: 'now'
      },
      { model: user }
    )
    should.exist(query.value())
    should.exist(query.toJSON())
    should.exist(query.input)
  })
  it('should work with basic value and filters', async () => {
    const query = new Aggregation(
      {
        value: { field: 'name' },
        alias: 'name',
        filters: {
          name: { $eq: 'Yo' }
        }
      },
      { model: user }
    )
    should.exist(query.value())
    should.exist(query.toJSON())
    should.exist(query.input)
  })
  it('should blow up when missing alias', async () => {
    try {
      new Aggregation(
        { value: { field: 'name' }, alias: null },
        { model: user }
      )
    } catch (err) {
      err.fields.should.eql([
        { path: ['alias'], value: null, message: 'Missing alias!' }
      ])
      return
    }
    throw new Error('Did not throw!')
  })
  it('should blow up when alias value invalid', async () => {
    try {
      new Aggregation(
        { value: { field: 'name' }, alias: true },
        { model: user }
      )
    } catch (err) {
      err.fields.should.eql([
        { path: ['alias'], value: true, message: 'Must be a string.' }
      ])
      return
    }
    throw new Error('Did not throw!')
  })
  it('should blow up when missing value', async () => {
    try {
      new Aggregation({ value: null, alias: 'name' }, { model: user })
    } catch (err) {
      err.fields.should.eql([
        { path: ['value'], value: null, message: 'Missing value!' }
      ])
      return
    }
    throw new Error('Did not throw!')
  })
  it('should blow up when filters value invalid', async () => {
    try {
      new Aggregation(
        { value: { field: 'name' }, filters: true, alias: 'name' },
        { model: user }
      )
    } catch (err) {
      err.fields.should.eql([
        {
          path: ['filters'],
          value: true,
          message: 'Must be an object or array.'
        }
      ])
      return
    }
    throw new Error('Did not throw!')
  })
  it('should blow up when filters has a bad value', async () => {
    try {
      new Aggregation(
        {
          value: { field: 'name' },
          filters: { doesNotExist: { $eq: true } },
          alias: 'name'
        },
        { model: user }
      )
    } catch (err) {
      err.fields.should.eql([
        {
          path: ['filters', 'doesNotExist'],
          value: 'doesNotExist',
          message: 'Field does not exist.'
        }
      ])
      return
    }
    throw new Error('Did not throw!')
  })
})
