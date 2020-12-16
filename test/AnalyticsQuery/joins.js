import should from 'should'
import { AnalyticsQuery } from '../../src'
import db from '../fixtures/db'
import call from '../fixtures/911-call'
import bikeTrip from '../fixtures/bike-trip'

/*
Cases to cover:

911 calls around bike trips, where the 911 call time is between the start and end of the bike trip time

SELECT SUM(a.passengers) / SUM(b.miles) from
FROM source_a
LEFT JOIN source_b ON a.route = b.route
WHERE date = 2019

SELECT
  sum(census.popn_total) AS totalPop
FROM nyc_subway_stations AS subways
LEFT JOIN census_tracts AS census
ON ST_DWithin(census.geom, subways.geom, 200)
WHERE subways.route = 'A';
*/
describe('AnalyticsQuery#joins', () => {
  const { datum } = db.models
  it('should handle a basic geospatial join', async () => {
    const query = new AnalyticsQuery({
      joins: {
        name: 'Nearby Calls',
        alias: 'nearbyCalls',
        filters: [
          { sourceId: '911-calls' },
          {
            function: 'intersects',
            arguments: [
              { field: 'data.location' },
              { field: '$parent.data.path' }
            ]
          }
        ]
      },
      aggregations: [
        {
          value: {
            function: 'distinctCount',
            arguments: [ { field: 'id' } ]
          },
          alias: 'totalTrips'
        },
        {
          value: {
            function: 'distinctCount',
            arguments: [ { field: 'nearbyCalls.id' } ]
          },
          alias: 'totalCalls'
        },
        {
          value: {
            function: 'extract',
            arguments: [ 'year', { field: 'data.startedAt' } ]
          },
          alias: 'year'
        }
      ],
      groupings: [
        { field: 'year' }
      ]
    }, {
      model: datum,
      subSchemas: { data: bikeTrip.schema },
      joins: {
        nearbyCalls: {
          model: datum,
          subSchemas: { data: call.schema }
        }
      }
    })

    query.constrain({
      where: [
        { sourceId: 'bike-trips' }
      ],
      joins: {
        nearbyCalls: {
          where: [ { sourceId: '911-calls' } ]
        }
      }
    })

    const res = await query.execute()
    should.exist(res)
    console.log(res)
  })
})
