import should from 'should'
import { AnalyticsQuery } from '../../../src'
import db from '../../fixtures/db'
import call from '../../fixtures/911-call'
import bikeTrip from '../../fixtures/bike-trip'
import transitPassenger from '../../fixtures/transit-passenger'
import transitTrip from '../../fixtures/transit-trip'

describe('AnalyticsQuery#joins', () => {
  const { datum } = db.models

  // 911 calls around bike trips
  it.only('should handle a geospatial join', async () => {
    const query = new AnalyticsQuery({
      joins: [ {
        name: 'Nearby Calls',
        alias: 'nearbyCalls',
        filters: [
          {
            function: 'intersects',
            arguments: [
              { field: 'data.location' },
              { field: '~parent.data.path' }
            ]
          }
        ]
      } ],
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
            arguments: [ { field: '~nearbyCalls.id' } ]
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
          where: [
            { sourceId: '911-calls' }
          ]
        }
      }
    })

    const res = await query.execute()
    should.exist(res)
    console.log(res)
  })

  // miles per passenger, from two sources that share a join key
  it('should handle a non-geospatial join', async () => {
    const query = new AnalyticsQuery({
      joins: [ {
        name: 'Trips',
        alias: 'trips',
        filters: [
          {
            'data.route': '~parent.data.route'
          },
          {
            'data.year': 2019
          }
        ]
      } ],
      aggregations: [
        {
          value: {
            function: 'divide',
            arguments: [
              {
                function: 'sum',
                arguments: [
                  { field: 'data.passengers' }
                ]
              },
              {
                function: 'sum',
                arguments: [
                  { field: '~trips.data.miles' }
                ]
              }
            ]
          },
          alias: 'milesPerPassenger'
        }
      ],
      filters: [
        {
          'data.year': 2019
        }
      ]
    }, {
      model: datum,
      subSchemas: { data: transitPassenger.schema },
      joins: {
        trips: {
          model: datum,
          subSchemas: { data: transitTrip.schema }
        }
      }
    })

    query.constrain({
      where: [
        { sourceId: 'transit-passengers' }
      ],
      joins: {
        trips: {
          where: [
            { sourceId: 'transit-trips' }
          ]
        }
      }
    })

    const res = await query.execute()
    should.exist(res)
    console.log(res)
  })
})
