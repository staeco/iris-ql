import should from 'should'
import fn from '../../src/types/getTypes'
import db from '../fixtures/db'
import dataType from '../fixtures/bike-trip'

describe('types#getTypes', () => {
  const opt = { model: db.models.datum, subSchemas: { data: dataType.schema } }
  it('should work on plain values', () => {
    should(fn(1)).eql([ { type: 'number' } ])
    should(fn('test')).eql([ { type: 'text' } ])
    should(fn(new Date())).eql([ { type: 'date' } ])
    should(fn(new Date().toISOString())).eql([ { type: 'text' }, { type: 'date' } ])
    should(fn({ type: 'Point', coordinates: [ 1, 1 ] })).eql([ { type: 'object' }, { type: 'point' } ])
  })
  it('should work on functions', () => {
    should(fn({ function: 'now' })).eql([ { type: 'date' } ])
    should(fn({ function: 'add', arguments: [ 1, 1 ] })).eql([ { type: 'number' } ])
  })
  it('should work on functions that bubble up types', () => {
    should(fn({ function: 'max', arguments: [ { field: 'data.startedAt' } ] }, opt)).eql([ { type: 'date' } ])
    should(fn({ function: 'max', arguments: [ { field: 'data.cost' } ] }, opt)).eql([ {
      type: 'number',
      measurement: {
        type: 'currency',
        value: 'usd'
      }
    } ])
  })
  it('should work on functions that bubble up measurements', () => {
    should(fn({ function: 'add', arguments: [ { field: 'data.cost' }, 1 ] }, opt)).eql([ {
      type: 'number',
      measurement: {
        type: 'currency',
        value: 'usd'
      }
    } ])
  })
  it('should work on plain fields', () => {
    should(fn({ field: 'data.startedAt' }, opt)).eql([ { type: 'date', validation: { required: true } } ])
    should(fn({ field: 'data.cost' }, opt)).eql([ {
      type: 'number',
      measurement: {
        type: 'currency',
        value: 'usd'
      },
      validation: {
        max: 10000,
        min: 0
      }
    } ])
  })
  it('should work on top-level', () => {
    should(fn({ field: 'createdAt' }, opt)).eql([ {
      name: 'Created',
      notes: 'Date and time this data was created',
      type: 'date'
    } ])
    should(fn({ field: 'sourceId' }, opt)).eql([ {
      name: 'Source ID',
      type: 'text'
    } ])
  })
})
