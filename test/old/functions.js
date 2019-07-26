import {
  min,
  max,
  sum,
  average,
  median,
  count,

  gt,
  lt,
  gte,
  lte,
  eq,
  add,
  subtract,
  multiply,
  divide,
  modulus,

  now,
  lastWeek,
  lastMonth,
  lastYear,
  interval,
  ms,
  truncate,
  extract,
  format,

  area,
  length,
  intersects,
  distance,
  geojson,
  boundingBox
} from 'lib/query/functions'
import types from 'connections/postgres'
import should from 'should'

const c = (v) => JSON.parse(JSON.stringify(v))

describe('lib#query#functions', () => {
  it('aggregations', () => {
    should(c(min(3))).eql({ fn: 'min', args: [ 3 ] }, 'min')
    should(c(max(3))).eql({ fn: 'max', args: [ 3 ] }, 'max')
    should(c(sum([ 3 , 5 ]))).eql({ fn: 'sum', args: [ [ 3, 5 ] ] }, 'sum')
    should(c(average([ 3, 5 ]))).eql({ fn: 'avg', args: [ [ 3, 5 ] ] }, 'average')
    should(c(median([ 3, 5, 6 ]))).eql({ fn: 'median', args: [ [ 3, 5, 6 ] ] }, 'median')
    should(c(count(types.literal('*')))).eql({ fn: 'count', args: [ { val: '*' } ] }, 'count')
  })
  it('math', () => {
    should(c(gt(1, 2))).eql({
      fn: 'gt',
      args: [
        { val: 1, type: 'numeric', json: false },
        { val: 2, type: 'numeric', json: false }
      ]
    }, 'gt')
    should(c(lt(1, 2))).eql({
      fn: 'lt',
      args: [
        { val: 1, type: 'numeric', json: false },
        { val: 2, type: 'numeric', json: false }
      ]
    }, 'lt')
    should(c(gte(1, 2))).eql({
      fn: 'gte',
      args: [
        { val: 1, type: 'numeric', json: false },
        { val: 2, type: 'numeric', json: false }
      ]
    }, 'gte')
    should(c(lte(1, 2))).eql({
      fn: 'lte',
      args: [
        { val: 1, type: 'numeric', json: false },
        { val: 2, type: 'numeric', json: false }
      ]
    }, 'lte')
    should(c(eq(1, 2))).eql({
      fn: 'eq',
      args: [
        { val: 1, type: 'numeric', json: false },
        { val: 2, type: 'numeric', json: false }
      ]
    }, 'eq')
    should(c(add(1, 2))).eql({
      fn: 'add',
      args: [
        { val: 1, type: 'numeric', json: false },
        { val: 2, type: 'numeric', json: false }
      ]
    }, 'add')
    should(c(subtract(1, 2))).eql({
      fn: 'sub',
      args: [
        { val: 1, type: 'numeric', json: false },
        { val: 2, type: 'numeric', json: false }
      ]
    }, 'subtract')
    should(c(multiply(1, 2))).eql({
      fn: 'mult',
      args: [
        { val: 1, type: 'numeric', json: false },
        { val: 2, type: 'numeric', json: false }
      ]
    }, 'multiply')
    should(c(divide(1, 2))).eql({
      fn: 'div',
      args: [
        { val: 1, type: 'numeric', json: false },
        { val: 2, type: 'numeric', json: false }
      ]
    }, 'divide')
    should(c(modulus(1, 2))).eql({
      fn: 'mod',
      args: [
        { val: 1, type: 'numeric', json: false },
        { val: 2, type: 'numeric', json: false }
      ]
    }, 'modulus')
  })
  it('time', () => {
    should(c(now())).eql({ fn: 'now', args: [] }, 'now')
    should(c(lastWeek())).eql({ val: `CURRENT_DATE - INTERVAL '7 days'` }, 'lastWeek')
    should(c(lastMonth())).eql({ val: `CURRENT_DATE - INTERVAL '1 month'` }, 'lastMonth')
    should(c(lastYear())).eql({ val: `CURRENT_DATE - INTERVAL '1 year'` }, 'lastYear')
    should(c(interval('12/7/1941 7:00:00 AM', '9/2/1945 2:00:00 PM'))).eql({
      fn: 'sub',
      args: [
        {
          json: false,
          type: 'numeric',
          val: {
            val: `extract(epoch from 9/2/1945 2:00:00 PM) * 1000`
          }
        },
        {
          json: false,
          type: 'numeric',
          val: {
            val: `extract(epoch from 12/7/1941 7:00:00 AM) * 1000`
          }
        }
      ]
    }, 'interval')
    should(c(ms('12/15/1991 12:00PM'))).eql({
      json: false,
      type: 'numeric',
      val: {
        val: `extract(epoch from 12/15/1991 12:00PM) * 1000`
      }
    }, 'ms')
    should(c(truncate({ raw: 'day' }, '2019-07-15 11:57 PM'))).eql({
      fn: 'date_trunc',
      args: [
        'day',
        '2019-07-15 11:57 PM'
      ]
    }, 'truncate')
    should(c(extract({ raw: 'hour' }, '2019-07-15 11:57 PM'))).eql({
      fn: 'date_part',
      args: [
        'hour',
        '2019-07-15 11:57 PM'
      ]
    }, 'extract')
    should(c(format('raw', 'func'))).eql({
      fn: 'to_char',
      args: [
        'func',
        'raw'
      ]
    }, 'format')
  })
  it('geospatial', () => {
    should(c(area({
      type: 'Point',
      coordinates: [
        -73.8901873393965,
        40.855315351578305
      ]
    }))).eql({
      fn: 'ST_Area',
      args: [
        {
          json: false,
          type: 'geography',
          val: {
            type: 'Point',
            coordinates: [
              -73.8901873393965,
              40.855315351578305
            ]
          }
        }
      ]
    }, 'area')
    should(c(length('1km'))).eql({
      fn: 'ST_Length',
      args: [
        {
          json: false,
          type: 'geography',
          val: '1km'
        }
      ]
    }, 'length')
    should(c(intersects('-92.686376', '35.029341'))).eql({
      fn: 'ST_Intersects',
      args: [
        {
          json: false,
          type: 'geometry',
          val: '-92.686376'
        },
        {
          json: false,
          type: 'geometry',
          val: '35.029341'
        }
      ]
    }, 'intersects')
    should(c(distance('-92.686376', '35.029341'))).eql({
      fn: 'ST_Distance',
      args: [
        {
          json: false,
          type: 'geometry',
          val: '-92.686376'
        },
        {
          json: false,
          type: 'geometry',
          val: '35.029341'
        }
      ]
    }, 'distance')

    const rawGeoJson = {
      raw: `{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": "24691032",
        "status": "Closed"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          -73.8901873393965,
          40.855315351578305
        ]
      }
    }
  ]
}`
    }
    should(c(geojson(rawGeoJson))).eql({
      fn: 'geocollection_from_geojson',
      args: [ rawGeoJson ]
    }, 'geojson - FeatureCollection')

    const rawGeoJsonFeature = {
      raw: `{
  "type": "Feature",
  "properties": {
    "id": "24691032",
    "status": "Closed"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [
      -73.8901873393965,
      40.855315351578305
    ]
  }
}`
    }
    should(c(geojson(rawGeoJsonFeature))).eql({
      fn: 'from_geojson',
      args: [ `{"type":"Point","coordinates":[-73.8901873393965,40.855315351578305]}` ]
    }, 'geojson - Feature')

    should(c(boundingBox({
      xmin: '-92.704076',
      xmax: '-92.686376',
      ymin: '35.029341',
      ymax: '35.038563'
    }))).eql({
      fn: 'ST_MakeEnvelope',
      args: [
        {
          xmin: '-92.704076',
          xmax: '-92.686376',
          ymin: '35.029341',
          ymax: '35.038563'
        },
        null,
        null,
        null
      ]
    }, 'boundingBox')
  })
})
