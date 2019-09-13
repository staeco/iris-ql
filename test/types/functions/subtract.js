import should from 'should'
import { AnalyticsQuery } from '../../../src'
import db from '../../fixtures/db'
import dataType from '../../fixtures/bike-trip'

describe('types#functions#subtract', () => {
  const { datum } = db.models

  it('should work with subfield / subfield', async () => {
    const funcVal = {
      function: 'subtract',
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
      { total: 1, type: 'electric', cost: 3.55 },
      { total: 1, type: 'regular', cost: 39.85 }
    ]
    const query = new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    const res = await query.execute()
    should(res).eql(expectedResponse)
  })
  it('should work with subfield / value', async () => {
    const funcVal = {
      function: 'subtract',
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
      { total: 1, type: 'electric', cost: 4.14 },
      { total: 1, type: 'regular', cost: 49.14 }
    ]
    const query = new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    const res = await query.execute()
    should(res).eql(expectedResponse)
  })
  it('should work with function / value', async () => {
    const funcVal = {
      function: 'subtract',
      arguments: [
        {
          function: 'add',
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
      { total: 1, type: 'electric', cost: 4.55 },
      { total: 1, type: 'regular', cost: 40.85 }
    ]
    const query = new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    const res = await query.execute()
    should(res).eql(expectedResponse)
  })
  it('should fail when given invalid arguments', async () => {
    const funcVal = {
      function: 'subtract',
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
        message: 'Argument "Value B" for "Subtract" must be of type: number - instead got text'
      } ])
      return
    }
    throw new Error('Did not throw!')
  })
  it('should bubble up schema correctly', async () => {
    const funcVal = {
      function: 'subtract',
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
        name: 'Total',
        type: 'number'
      },
      type: {
        name: 'Type',
        type: 'text'
      },
      cost: {
        name: 'Cost',
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
