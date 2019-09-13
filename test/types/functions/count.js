import should from 'should'
import { AnalyticsQuery } from '../../../src'
import db from '../../fixtures/db'
import dataType from '../../fixtures/bike-trip'

describe('types#functions#count', () => {
  const { datum } = db.models

  it('should work', async () => {
    const funcVal = { function: 'count' }
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
  it('should bubble up schema correctly', async () => {
    const funcVal = { function: 'count' }
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
