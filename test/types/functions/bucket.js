import should from 'should'
import { AnalyticsQuery } from '../../../src'
import db from '../../fixtures/db'
import dataType from '../../fixtures/bike-trip'

const reserialize = (o) => JSON.parse(JSON.stringify(o))

describe('types#functions#bucket', () => {
  const { datum } = db.models

  it('should work bucketing year', async () => {
    const funcVal = {
      function: 'bucket',
      arguments: ['year', { field: 'data.startedAt' }]
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'count' }, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' },
        { value: funcVal, alias: 'year' }
      ],
      groupings: [{ field: 'type' }, { field: 'year' }]
    }
    const expectedResponse = [
      { total: 1, type: 'electric', year: '2017-01-01T00:00:00.000Z' },
      { total: 1, type: 'regular', year: '2017-01-01T00:00:00.000Z' }
    ]
    const query = new AnalyticsQuery(fullQuery, {
      model: datum,
      subSchemas: { data: dataType.schema }
    })
    const res = reserialize(await query.execute())
    should(res).eql(expectedResponse)
  })
  it('should work bucketing custom year when set to 1', async () => {
    const funcVal = {
      function: 'bucket',
      arguments: ['customYear', { field: 'data.startedAt' }]
    }
    const fullQuery = {
      customYearStart: 1, // data is all month 5
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'count' }, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' },
        { value: funcVal, alias: 'year' }
      ],
      groupings: [{ field: 'type' }, { field: 'year' }]
    }
    const expectedResponse = [
      { total: 1, type: 'electric', year: '2017-01-01T00:00:00.000Z' },
      { total: 1, type: 'regular', year: '2017-01-01T00:00:00.000Z' }
    ]
    const query = new AnalyticsQuery(fullQuery, {
      model: datum,
      subSchemas: { data: dataType.schema }
    })
    const res = reserialize(await query.execute())
    should(res).eql(expectedResponse)
  })
  it('should work bucketing custom year forwards', async () => {
    const funcVal = {
      function: 'bucket',
      arguments: ['customYear', { field: 'data.startedAt' }]
    }
    const fullQuery = {
      customYearStart: 4, // data is all month 5
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'count' }, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' },
        { value: funcVal, alias: 'year' }
      ],
      groupings: [{ field: 'type' }, { field: 'year' }]
    }
    const expectedResponse = [
      { total: 1, type: 'electric', year: '2017-04-01T00:00:00.000Z' },
      { total: 1, type: 'regular', year: '2017-04-01T00:00:00.000Z' }
    ]
    const query = new AnalyticsQuery(fullQuery, {
      model: datum,
      subSchemas: { data: dataType.schema }
    })
    const res = reserialize(await query.execute())
    should(res).eql(expectedResponse)
  })
  it('should work bucketing custom year backwards', async () => {
    const funcVal = {
      function: 'bucket',
      arguments: ['customYear', { field: 'data.startedAt' }]
    }
    const fullQuery = {
      customYearStart: 6, // data is all month 5
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'count' }, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' },
        { value: funcVal, alias: 'year' }
      ],
      groupings: [{ field: 'type' }, { field: 'year' }]
    }
    const expectedResponse = [
      { total: 1, type: 'electric', year: '2016-06-01T00:00:00.000Z' },
      { total: 1, type: 'regular', year: '2016-06-01T00:00:00.000Z' }
    ]
    const query = new AnalyticsQuery(fullQuery, {
      model: datum,
      subSchemas: { data: dataType.schema }
    })
    const res = reserialize(await query.execute())
    should(res).eql(expectedResponse)
  })
  it('should work bucketing custom year backwards with timezone', async () => {
    const funcVal = {
      function: 'bucket',
      arguments: ['customYear', { field: 'data.startedAt' }]
    }
    const fullQuery = {
      timezone: 'America/Los_Angeles',
      customYearStart: 6, // data is all month 5
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'count' }, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' },
        { value: funcVal, alias: 'year' }
      ],
      groupings: [{ field: 'type' }, { field: 'year' }]
    }
    const expectedResponse = [
      { total: 1, type: 'electric', year: '2016-06-01T07:00:00.000Z' },
      { total: 1, type: 'regular', year: '2016-06-01T07:00:00.000Z' }
    ]
    const query = new AnalyticsQuery(fullQuery, {
      model: datum,
      subSchemas: { data: dataType.schema }
    })
    const res = reserialize(await query.execute())
    should(res).eql(expectedResponse)
  })
  it('should fail when given invalid arguments', async () => {
    const funcVal = {
      function: 'bucket',
      arguments: ['yearr', { field: 'data.startedAt' }]
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'count' }, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' },
        { value: funcVal, alias: 'year' }
      ],
      groupings: [{ field: 'type' }, { field: 'year' }]
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
          path: ['aggregations', 2, 'value', 'arguments', 0],
          value: 'yearr',
          message:
            'Argument "Unit" for "Bucket Date" must be one of: second, minute, hour, day, week, month, quarter, customQuarter, year, customYear, decade'
        }
      ])
      return
    }
    throw new Error('Did not throw!')
  })
  it('should bubble up schema correctly', async () => {
    const funcVal = {
      function: 'bucket',
      arguments: ['year', { field: 'data.startedAt' }]
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'count' }, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' },
        { value: funcVal, alias: 'year' }
      ],
      groupings: [{ field: 'type' }, { field: 'year' }]
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
      year: {
        name: 'Year',
        type: 'date',
        measurement: {
          type: 'bucket',
          value: 'year'
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
  it('should default customYearStart', async () => {
    const funcVal = {
      function: 'bucket',
      arguments: ['customYear', { field: 'data.startedAt' }]
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'count' }, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' },
        { value: funcVal, alias: 'year' }
      ],
      groupings: [{ field: 'type' }, { field: 'year' }]
    }
    new AnalyticsQuery(fullQuery, {
      model: datum,
      subSchemas: { data: dataType.schema }
    })
  })
})
