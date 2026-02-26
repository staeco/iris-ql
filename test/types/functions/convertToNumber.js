import should from 'should'
import { AnalyticsQuery } from '../../../src'
import db from '../../fixtures/db'
import dataType from '../../fixtures/car-trip'

describe('types#functions#convertToNumber', () => {
  const { datum } = db.models

  it('should work', async () => {
    const funcVal = {
      function: 'convertToNumber',
      arguments: [ { field: 'data.cost' } ]
    }
    const fullQuery = {
      filters: { sourceId: 'car-trips' },
      aggregations: [
        { value: { function: 'sum', arguments: [ funcVal ] }, alias: 'total' },
        { value: { field: 'data.pickUp' }, alias: 'pickUp' }
      ],
      groupings: [
        { field: 'pickUp' }
      ]
    }
    const expectedResponse = [
      { total: 200, pickUp: 'Bronx' },
      { total: 0, pickUp: 'Manhattan' },
      { total: 0, pickUp: 'Queens' }
    ]
    const query = new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    const res = await query.execute()
    should(res).eql(expectedResponse)
  })
  it('should bubble up schema correctly', async () => {
    const funcVal = { function: 'convertToNumber', arguments: [ { field: 'data.cost' } ] }
    const fullQuery = {
      filters: { sourceId: 'car-trips' },
      aggregations: [
        { value: { function: 'sum', arguments: [ funcVal ] }, alias: 'total' },
        { value: { field: 'data.pickUp' }, alias: 'pickUp' }
      ],
      groupings: [
        { field: 'pickUp' }
      ]
    }
    const expectedResponse = {
      total: {
        name: 'Total',
        type: 'number'
      },
      pickUp: {
        name: 'Pick Up',
        type: 'text',
        validation: { required: true, notEmpty: true }
      }
    }
    const query = new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    const res = query.getOutputSchema()
    should(res).eql(expectedResponse)
  })
})
