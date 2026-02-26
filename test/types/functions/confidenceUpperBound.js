import should from 'should'
import { AnalyticsQuery } from '../../../src'
import db from '../../fixtures/db'
import dataType from '../../fixtures/transit-passenger'

describe('types#functions#confidenceUpperBound', () => {
  const { datum } = db.models

  it('should work', async () => {
    const funcVal = {
      function: 'confidenceUpperBound',
      arguments: [ { field: 'data.age' } ]
    }
    const fullQuery = {
      filters: { sourceId: 'transit-passengers' },
      aggregations: [
        { value: funcVal, alias: 'age' },
        { value: { field: 'data.year' }, alias: 'year' }
      ],
      groupings: [
        { field: 'year' }
      ]
    }
    const expectedResponse = [
      { age: 20.385929291125635, year: 2018 },
      { age: 26.59660744462696, year: 2019 }
    ]
    const query = new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    const res = await query.execute()
    should(res).eql(expectedResponse)
  })
  it('should work with no groupings', async () => {
    const funcVal = {
      function: 'confidenceUpperBound',
      arguments: [ { field: 'data.age' } ]
    }
    const fullQuery = {
      filters: { sourceId: 'transit-passengers' },
      aggregations: [
        { value: funcVal, alias: 'age' }
      ]
    }
    const expectedResponse = [
      { age: 24.29917161319828 }
    ]
    const query = new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    const res = await query.execute()
    should(res).eql(expectedResponse)
  })
  it('should fail when missing argument', async () => {
    const funcVal = {
      function: 'confidenceUpperBound',
      arguments: []
    }
    const fullQuery = {
      filters: { sourceId: 'transit-passengers' },
      aggregations: [
        { value: { field: 'data.year' }, alias: 'year' },
        { value: funcVal, alias: 'age' }
      ],
      groupings: [
        { field: 'year' }
      ]
    }
    try {
      new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    } catch (err) {
      should.exist(err)
      should(err.fields).eql([ {
        path: [ 'aggregations', 1, 'value', 'arguments', 0 ],
        value: undefined,
        message: 'Argument "Value A" for "Confidence Interval Upper" is required'
      } ])
      return
    }
    throw new Error('Did not throw!')
  })
  it('should bubble up schema correctly', async () => {
    const funcVal = { function: 'confidenceUpperBound', arguments: [ { field: 'data.age' } ] }
    const fullQuery = {
      filters: { sourceId: 'transit-passengers' },
      aggregations: [
        { value: funcVal, alias: 'age' },
        { value: { field: 'data.year' }, alias: 'year' }
      ],
      groupings: [
        { field: 'year' }
      ]
    }
    const expectedResponse = {
      age: { name: 'Age', type: 'number' },
      year: {
        name: 'Received',
        type: 'number',
        measurement: { type: 'datePart', value: 'year' },
        validation: { required: true }
      }
    }
    const query = new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    const res = query.getOutputSchema()
    should(res).eql(expectedResponse)
  })
})

