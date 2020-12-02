import should from 'should'
import { AnalyticsQuery } from '../../../src'
import db from '../../fixtures/db'
import dataType from '../../fixtures/bike-trip'

describe('types#functions#extract', () => {
  const { datum } = db.models

  it('should work extacting year', async () => {
    const funcVal = {
      function: 'extract',
      arguments: [
        'year',
        { field: 'data.startedAt' }
      ]
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'count' }, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' },
        { value: funcVal, alias: 'year' }
      ],
      groupings: [
        { field: 'type' },
        { field: 'year' }
      ]
    }
    const expectedResponse = [
      { total: 1, type: 'electric', year: 2017 },
      { total: 1, type: 'regular', year: 2017 }
    ]
    const query = new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    const res = await query.execute()
    should(res).eql(expectedResponse)
  })
  it('should work extacting custom year when set to 1', async () => {
    const funcVal = {
      function: 'extract',
      arguments: [
        'customYear',
        { field: 'data.startedAt' }
      ]
    }
    const fullQuery = {
      customYearStart: 1, // data is all month 5
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'count' }, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' },
        { value: funcVal, alias: 'year' }
      ],
      groupings: [
        { field: 'type' },
        { field: 'year' }
      ]
    }
    const expectedResponse = [
      { total: 1, type: 'electric', year: 2017 },
      { total: 1, type: 'regular', year: 2017 }
    ]
    const query = new AnalyticsQuery(fullQuery, {
      model: datum,
      subSchemas: { data: dataType.schema }
    })
    const res = await query.execute()
    should(res).eql(expectedResponse)
  })
  it('should work extacting custom year forwards', async () => {
    const funcVal = {
      function: 'extract',
      arguments: [
        'customYear',
        { field: 'data.startedAt' }
      ]
    }
    const fullQuery = {
      customYearStart: 4, // data is all month 5
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'count' }, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' },
        { value: funcVal, alias: 'year' }
      ],
      groupings: [
        { field: 'type' },
        { field: 'year' }
      ]
    }
    const expectedResponse = [
      { total: 1, type: 'electric', year: 2018 },
      { total: 1, type: 'regular', year: 2018 }
    ]
    const query = new AnalyticsQuery(fullQuery, {
      model: datum,
      subSchemas: { data: dataType.schema }
    })
    const res = await query.execute()
    should(res).eql(expectedResponse)
  })
  it('should work extacting custom year backwards', async () => {
    const funcVal = {
      function: 'extract',
      arguments: [
        'customYear',
        { field: 'data.startedAt' }
      ]
    }
    const fullQuery = {
      customYearStart: 6, // data is all month 5
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'count' }, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' },
        { value: funcVal, alias: 'year' }
      ],
      groupings: [
        { field: 'type' },
        { field: 'year' }
      ]
    }
    const expectedResponse = [
      { total: 1, type: 'electric', year: 2017 },
      { total: 1, type: 'regular', year: 2017 }
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
      function: 'extract',
      arguments: [
        'yearr',
        { field: 'data.startedAt' }
      ]
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'count' }, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' },
        { value: funcVal, alias: 'year' }
      ],
      groupings: [
        { field: 'type' },
        { field: 'year' }
      ]
    }
    try {
      new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    } catch (err) {
      should.exist(err)
      should(err.fields).eql([ {
        path: [ 'aggregations', 2, 'value', 'arguments', 0 ],
        value: 'yearr',
        message: 'Argument "Unit" for "Part of Date" must be one of: hourOfDay, dayOfWeek, dayOfMonth, dayOfYear, week, month, customMonth, quarter, customQuarter, year, customYear, decade'
      } ])
      return
    }
    throw new Error('Did not throw!')
  })
  it('should bubble up schema correctly', async () => {
    const funcVal = {
      function: 'extract',
      arguments: [
        'year',
        { field: 'data.startedAt' }
      ]
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'count' }, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' },
        { value: funcVal, alias: 'year' }
      ],
      groupings: [
        { field: 'type' },
        { field: 'year' }
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
      },
      year: {
        name: 'Year',
        type: 'number',
        measurement: {
          type: 'datePart',
          value: 'year'
        }
      }
    }
    const query = new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    const res = query.getOutputSchema()
    should(res).eql(expectedResponse)
  })
  it('should fail when missing customYearStart', async () => {
    const funcVal = {
      function: 'extract',
      arguments: [
        'customYear',
        { field: 'data.startedAt' }
      ]
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'count' }, alias: 'total' },
        { value: { field: 'data.type' }, alias: 'type' },
        { value: funcVal, alias: 'year' }
      ],
      groupings: [
        { field: 'type' },
        { field: 'year' }
      ]
    }
    try {
      new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    } catch (err) {
      should.exist(err)
      should(err.fields).eql([ {
        path: [ 'aggregations', 2, 'value' ],
        value: funcVal,
        message: 'Missing customYearStart!'
      } ])
      return
    }
    throw new Error('Did not throw!')
  })
})
