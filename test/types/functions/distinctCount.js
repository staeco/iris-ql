import should from 'should'
import { AnalyticsQuery } from '../../../src'
import db from '../../fixtures/db'
import dataType from '../../fixtures/bike-trip'

describe('types#functions#distinctCount', () => {
  const { datum } = db.models

  it('should work', async () => {
    const funcVal = {
      function: 'distinctCount',
      arguments: [ { field: 'data.path' } ]
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: funcVal, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' }
      ],
      groupings: [
        { field: 'type' }
      ]
    }
    const expectedResponse = [
      { total: 1, type: 'electric' },
      { total: 1, type: 'regular' }
    ]
    const query = new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    const res = await query.execute()
    should(res).eql(expectedResponse)
  })
  it('should work with no groupings', async () => {
    const funcVal = {
      function: 'distinctCount',
      arguments: [ { field: 'data.path' } ]
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: funcVal, alias: 'total' }
      ]
    }
    const expectedResponse = [
      { total: 1 }
    ]
    const query = new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    const res = await query.execute()
    should(res).eql(expectedResponse)
  })
  it('should fail when missing argument', async () => {
    const funcVal = {
      function: 'distinctCount',
      arguments: []
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'count' }, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' },
        { value: funcVal, alias: 'count' }
      ],
      groupings: [
        { field: 'type' }
      ]
    }
    try {
      new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    } catch (err) {
      should.exist(err)
      should(err.fields).eql([ {
        path: [ 'aggregations', 2, 'value', 'arguments', 0 ],
        value: undefined,
        message: 'Argument "Field" for "Unique Count" is required'
      } ])
      return
    }
    throw new Error('Did not throw!')
  })
  it('should bubble up schema correctly', async () => {
    const funcVal = { function: 'distinctCount', arguments: [ { field: 'data.path' } ] }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: funcVal, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' }
      ],
      groupings: [
        { field: 'type' }
      ]
    }
    const expectedResponse = {
      total: {
        name: 'Total',
        type: 'number'
      },
      type: {
        name: 'Type',
        type: 'text',
        validation: { notEmpty: true, maxLength: 2048 }
      }
    }
    const query = new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    const res = query.getOutputSchema()
    should(res).eql(expectedResponse)
  })
})
