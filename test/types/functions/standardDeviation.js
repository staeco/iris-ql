import should from 'should'
import { AnalyticsQuery } from '../../../src'
import db from '../../fixtures/db'
import dataType from '../../fixtures/bike-trip'

describe('types#functions#standardDeviation', () => {
  const { datum } = db.models

  it('should work with groupings', async () => {
    const funcVal = {
      function: 'standardDeviation',
      arguments: [ { field: 'data.cost' } ]
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: funcVal, alias: 'cost' },
        { value: { field: 'data.type' }, alias: 'type' }
      ],
      groupings: [
        { field: 'type' }
      ]
    }
    const expectedResponse = [
      { cost: 0, type: 'electric' },
      { cost: 0, type: 'regular' }
    ]
    const query = new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    const res = await query.execute()
    should(res).eql(expectedResponse)
  })
  it('should work with no groupings', async () => {
    const funcVal = {
      function: 'standardDeviation',
      arguments: [ { field: 'data.cost' } ]
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: funcVal, alias: 'cost' }
      ]
    }
    const expectedResponse = [
      { cost: 22.5 }
    ]
    const query = new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    const res = await query.execute()

    should(res).eql(expectedResponse)
  })
  it('should fail when given invalid arguments', async () => {
    const funcVal = {
      function: 'standardDeviation',
      arguments: [
        'abc'
      ]
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: funcVal, alias: 'cost' }
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
        path: [ 'aggregations', 0, 'value', 'arguments', 0 ],
        value: 'abc',
        message: 'Argument "Value" for "Standard Deviation" must be of type: number - instead got text'
      } ])
      return
    }
    throw new Error('Did not throw!')
  })
  it('should bubble up schema correctly', async () => {
    const funcVal = {
      function: 'standardDeviation',
      arguments: [
        { field: 'data.cost' }
      ]
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: funcVal, alias: 'cost' },
        { value: { field: 'data.type' }, alias: 'type' }
      ],
      groupings: [
        { field: 'type' }
      ]
    }
    const expectedResponse = {
      cost: {
        name: 'Cost',
        type: 'number',
        measurement: {
          type: 'currency',
          value: 'usd'
        }
      },
      type: {
        name: 'Type',
        type: 'text',
        validation: {
          notEmpty: true,
          maxLength: 2048
        }
      }
    }
    const query = new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    const res = query.getOutputSchema()
    should(res).eql(expectedResponse)
  })
})
