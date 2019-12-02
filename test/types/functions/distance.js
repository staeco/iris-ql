import should from 'should'
import { AnalyticsQuery } from '../../../src'
import db from '../../fixtures/db'
import dataType from '../../fixtures/bike-trip'

describe('types#functions#distance', () => {
  const { datum } = db.models

  it('should work', async () => {
    const funcVal = {
      function: 'distance',
      arguments: [
        { field: 'data.path' },
        { function: 'geojson', arguments: [ '{"type":"Point","coordinates":[1.01,8]}' ] }
      ]
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'average', arguments: [ funcVal ] }, alias: 'totalDistance' },
        { value: { field: 'data.type' }, alias: 'type' }
      ],
      groupings: [
        { field: 'type' }
      ]
    }
    // expected distance is 1/8 to 1.01/8, they run parallel so have a distance of 1deg to meters
    const expectedResponse = [
      { totalDistance: 1102.432847, type: 'electric' },
      { totalDistance: 1102.432847, type: 'regular' }
    ]
    const query = new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    const res = await query.execute()
    should(res).eql(expectedResponse)
  })
  it('should work when intersecting', async () => {
    const funcVal = {
      function: 'distance',
      arguments: [
        { field: 'data.path' },
        { function: 'geojson', arguments: [ '{"type":"Point","coordinates":[1,9]}' ] }
      ]
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'average', arguments: [ funcVal ] }, alias: 'totalDistance' },
        { value: { field: 'data.type' }, alias: 'type' }
      ],
      groupings: [
        { field: 'type' }
      ]
    }
    // expected distance is 1/8 to 1/9, they intersect so 0
    const expectedResponse = [
      { totalDistance: 0, type: 'electric' },
      { totalDistance: 0, type: 'regular' }
    ]
    const query = new AnalyticsQuery(fullQuery, { model: datum, subSchemas: { data: dataType.schema } })
    const res = await query.execute()
    should(res).eql(expectedResponse)
  })
  it('should fail when given invalid arguments', async () => {
    const funcVal = {
      function: 'distance',
      arguments: [
        { field: 'data.path' },
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
        message: 'Argument "Geometry B" for "Distance" must be of type: point, polygon, multipolygon, line, multiline, geometry - instead got text'
      } ])
      return
    }
    throw new Error('Did not throw!')
  })
  it('should bubble up schema correctly', async () => {
    const funcVal = {
      function: 'distance',
      arguments: [
        { field: 'data.path' },
        { function: 'geojson', arguments: [ '{"type":"Point","coordinates":[100, 100]}' ] }
      ]
    }
    const fullQuery = {
      filters: { sourceId: 'bike-trips' },
      aggregations: [
        { value: { function: 'sum', arguments: [ funcVal ] }, alias: 'totalDistance' },
        { value: { field: 'data.type' }, alias: 'type' }
      ],
      groupings: [
        { field: 'type' }
      ]
    }
    const expectedResponse = {
      totalDistance: {
        name: 'Total Distance',
        type: 'number',
        measurement: {
          type: 'distance',
          value: 'meter'
        }
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
