import should from 'should'
import { AnalyticsQuery } from '../../../src'
import db from '../../fixtures/db'
import dataType from '../../fixtures/transit-passenger'

describe('types#functions#confidenceLowerBound', () => {
  const { datum } = db.models

  it('should work', async () => {
    const funcVal = {
      function: 'confidenceLowerBound',
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
      { age: 17.614070708874365, year: 2018 },
      { age: 17.40339255537304, year: 2019 }
    ]
    const query = new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    const res = await query.execute()
    should(res).eql(expectedResponse)
  })
  it('should work with no groupings', async () => {
    const funcVal = {
      function: 'confidenceLowerBound',
      arguments: [ { field: 'data.age' } ]
    }
    const fullQuery = {
      filters: { sourceId: 'transit-passengers' },
      aggregations: [
        { value: funcVal, alias: 'age' }
      ]
    }
    const expectedResponse = [
      { age: 17.70082838680172 }
    ]
    const query = new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    const res = await query.execute()
    should(res).eql(expectedResponse)
  })
  it('should fail when missing argument', async () => {
    const funcVal = {
      function: 'confidenceLowerBound',
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
        message: 'Argument "Value A" for "Confidence Interval Lower" is required'
      } ])
      return
    }
    throw new Error('Did not throw!')
  })
  it('should bubble up schema correctly', async () => {
    const funcVal = { function: 'confidenceLowerBound', arguments: [ { field: 'data.age' } ] }
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

