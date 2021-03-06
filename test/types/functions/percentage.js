import should from 'should'
import { AnalyticsQuery } from '../../../src'
import db from '../../fixtures/db'
import dataType from '../../fixtures/bike-trip'

describe('types#functions#percentage', () => {
  const { datum } = db.models

  it('should work with subfield / subfield', async () => {
    const funcVal = {
      function: 'percentage',
      arguments: [
        { field: 'data.tax' },
        { field: 'data.cost' }
      ]
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'count' }, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' },
        { value: { function: 'sum', arguments: [ funcVal ] }, alias: 'avgTaxRatio' }
      ],
      groupings: [
        { field: 'type' }
      ]
    }
    const expectedResponse = [
      { total: 1, type: 'electric', avgTaxRatio: 0.3093385214007782 },
      { total: 1, type: 'regular', avgTaxRatio: 0.2052253689668927 }
    ]
    const query = new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    const res = await query.execute()
    should(res).eql(expectedResponse)
  })
  it('should work with value / subfield', async () => {
    const funcVal = {
      function: 'percentage',
      arguments: [
        1,
        { field: 'data.cost' }
      ]
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'count' }, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' },
        { value: { function: 'sum', arguments: [ funcVal ] }, alias: 'costRatio' }
      ],
      groupings: [
        { field: 'type' }
      ]
    }
    const expectedResponse = [
      { total: 1, type: 'electric', costRatio: 0.19455252918287938 },
      { total: 1, type: 'regular', costRatio: 0.01994415636218588 }
    ]
    const query = new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    const res = await query.execute()
    should(res).eql(expectedResponse)
  })
  it('should fail when given invalid arguments', async () => {
    const funcVal = {
      function: 'percentage',
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
        message: 'Argument "Value B" for "Percentage" must be of type: number - instead got text'
      } ])
      return
    }
    throw new Error('Did not throw!')
  })
})
