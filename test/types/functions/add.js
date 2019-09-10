import should from 'should'
import { AnalyticsQuery } from '../../../src'
import db from '../../fixtures/db'
import dataType from '../../fixtures/bike-trip'

describe('types#functions#add', () => {
  const { datum } = db.models

  it('should work with subfield / subfield', async () => {
    const funcVal = {
      function: 'add',
      arguments: [
        { field: 'data.cost' },
        { field: 'data.tax' }
      ]
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'count' }, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' },
        { value: { function: 'sum', arguments: [ funcVal ] }, alias: 'cost' }
      ],
      groupings: [
        { field: 'type' }
      ]
    }
    const expectedResponse = [
      { total: 1, type: 'electric', cost: 6.73 },
      { total: 1, type: 'regular', cost: 60.43 }
    ]
    const query = new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    const res = await query.execute()
    should(res).eql(expectedResponse)
  })
  it('should work with subfield / value', async () => {
    const funcVal = {
      function: 'add',
      arguments: [
        { field: 'data.cost' },
        1
      ]
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'count' }, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' },
        { value: { function: 'sum', arguments: [ funcVal ] }, alias: 'cost' }
      ],
      groupings: [
        { field: 'type' }
      ]
    }
    const expectedResponse = [
      { total: 1, type: 'electric', cost: 6.14 },
      { total: 1, type: 'regular', cost: 51.14 }
    ]
    const query = new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    const res = await query.execute()
    should(res).eql(expectedResponse)
  })
  it('should work with function / value', async () => {
    const funcVal = {
      function: 'add',
      arguments: [
        {
          function: 'subtract',
          arguments: [
            { field: 'data.cost' },
            1
          ]
        },
        { field: 'data.tax' }
      ]
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'count' }, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' },
        { value: { function: 'sum', arguments: [ funcVal ] }, alias: 'cost' }
      ],
      groupings: [
        { field: 'type' }
      ]
    }
    const expectedResponse = [
      { total: 1, type: 'electric', cost: 5.73 },
      { total: 1, type: 'regular', cost: 59.43 }
    ]
    const query = new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    const res = await query.execute()
    should(res).eql(expectedResponse)
  })
  it('should fail when given invalid arguments', async () => {
    const funcVal = {
      function: 'add',
      arguments: [
        { field: 'data.cost' },
        'abc'
      ]
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'count' }, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' },
        { value: { function: 'sum', arguments: [ funcVal ] }, alias: 'cost' }
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
        path: [ 'aggregations', 2, 'value', 'arguments', 0, 'arguments', 1 ],
        value: 'abc',
        message: 'Argument "Value B" for "Add" must be of type: number - instead got any, text'
      } ])
      return
    }
    throw new Error('Did not throw!')
  })
  it('should bubble up schema correctly', async () => {
    const funcVal = {
      function: 'add',
      arguments: [
        {
          function: 'subtract',
          arguments: [
            { field: 'data.cost' },
            1
          ]
        },
        { field: 'data.tax' }
      ]
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'count' }, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' },
        { value: { function: 'sum', arguments: [ funcVal ] }, alias: 'cost' }
      ],
      groupings: [
        { field: 'type' }
      ]
    }
    const expectedResponse = {
      total: {
        type: 'number'
      },
      type: {
        type: 'text'
      },
      cost: {
        type: 'number',
        measurement: {
          type: 'currency',
          value: 'usd'
        }
      }
    }
    const query = new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    const res = query.getOutputSchema()
    should(res).eql(expectedResponse)
  })
})