import should from 'should'
import { AnalyticsQuery } from '../../../src'
import db from '../../fixtures/db'
import dataType from '../../fixtures/bike-trip'

describe('types#functions#divide', () => {
  const { datum } = db.models

  it('should work with subfield / subfield', async () => {
    const funcVal = {
      function: 'divide',
      arguments: [{ field: 'data.cost' }, { field: 'data.tax' }]
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'count' }, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' },
        { value: { function: 'sum', arguments: [funcVal] }, alias: 'cost' }
      ],
      groupings: [{ field: 'type' }]
    }
    const expectedResponse = [
      { total: 1, type: 'electric', cost: 3.2327044025157234 },
      { total: 1, type: 'regular', cost: 4.872691933916424 }
    ]
    const query = new AnalyticsQuery(fullQuery, {
      model: datum,
      subSchemas: { data: dataType.schema }
    })
    const res = await query.execute()
    should(res).eql(expectedResponse)
  })
  it('should work with subfield / value', async () => {
    const funcVal = {
      function: 'divide',
      arguments: [{ field: 'data.cost' }, 2]
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'count' }, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' },
        { value: { function: 'sum', arguments: [funcVal] }, alias: 'cost' }
      ],
      groupings: [{ field: 'type' }]
    }
    const expectedResponse = [
      { total: 1, type: 'electric', cost: 2.57 },
      { total: 1, type: 'regular', cost: 25.07 }
    ]
    const query = new AnalyticsQuery(fullQuery, {
      model: datum,
      subSchemas: { data: dataType.schema }
    })
    const res = await query.execute()
    should(res).eql(expectedResponse)
  })
  it('should work with function / value', async () => {
    const funcVal = {
      function: 'divide',
      arguments: [
        {
          function: 'subtract',
          arguments: [{ field: 'data.cost' }, 1]
        },
        { field: 'data.tax' }
      ]
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'count' }, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' },
        { value: { function: 'sum', arguments: [funcVal] }, alias: 'cost' }
      ],
      groupings: [{ field: 'type' }]
    }
    const expectedResponse = [
      { total: 1, type: 'electric', cost: 2.6037735849056602 },
      { total: 1, type: 'regular', cost: 4.775510204081633 }
    ]
    const query = new AnalyticsQuery(fullQuery, {
      model: datum,
      subSchemas: { data: dataType.schema }
    })
    const res = await query.execute()
    should(res).eql(expectedResponse)
  })
  it('should fail when given invalid arguments', async () => {
    const funcVal = {
      function: 'divide',
      arguments: [{ field: 'data.cost' }, 'abc']
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'count' }, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' },
        { value: { function: 'sum', arguments: [funcVal] }, alias: 'cost' }
      ],
      groupings: [{ field: 'type' }]
    }
    try {
      new AnalyticsQuery(fullQuery, {
        model: datum,
        subSchemas: { data: dataType.schema }
      })
    } catch (err) {
      should.exist(err)
      should(err.fields).eql([
        {
          path: ['aggregations', 2, 'value', 'arguments', 0, 'arguments', 1],
          value: 'abc',
          message:
            'Argument "Value B" for "Divide" must be of type: number - instead got text'
        }
      ])
      return
    }
    throw new Error('Did not throw!')
  })
  it('should bubble up schema correctly', async () => {
    const funcVal = {
      function: 'divide',
      arguments: [
        {
          function: 'subtract',
          arguments: [{ field: 'data.cost' }, 1]
        },
        { field: 'data.tax' }
      ]
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'count' }, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' },
        { value: { function: 'sum', arguments: [funcVal] }, alias: 'cost' }
      ],
      groupings: [{ field: 'type' }]
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
    const query = new AnalyticsQuery(fullQuery, {
      model: datum,
      subSchemas: { data: dataType.schema }
    })
    const res = query.getOutputSchema()
    should(res).eql(expectedResponse)
  })
})
