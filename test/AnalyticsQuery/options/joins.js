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
  it('should handle a geospatial join', async () => {
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
    should(res).eql([
      { totalTrips: 2, totalCalls: 1, year: 2017 }
    ])
  })
  it('should handle a geospatial join with complete constraints', async () => {
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
            { sourceId: 'ldfgldkfgjldfkjg' }
          ]
        }
      }
    })

    const res = await query.execute()
    should.exist(res)
    should(res).eql([
      { totalTrips: 2, totalCalls: 0, year: 2017 }
    ])
  })
  it('should handle a join where required is false', async () => {
    const query = new AnalyticsQuery({
      joins: [ {
        name: 'Nearby Calls',
        alias: 'nearbyCalls',
        required: true,
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
            { sourceId: 'ldfgldkfgjldfkjg' }
          ]
        }
      }
    })

    const res = await query.execute()
    should.exist(res)
    should(res).eql([])
  })

  // miles per passenger, from two sources that share a join key
  it('should handle a non-geospatial join', async () => {
    const query = new AnalyticsQuery({
      joins: [ {
        name: 'Trips',
        alias: 'trips',
        filters: [
          {
            'data.year': { field: '~parent.data.year' }
          }
        ]
      } ],
      aggregations: [
        {
          value: {
            function: 'sum',
            arguments: [
              { field: 'data.passengers' }
            ]
          },
          alias: 'totalPassengers'
        },
        {
          value: {
            function: 'sum',
            arguments: [
              { field: '~trips.data.miles' }
            ]
          },
          alias: 'totalMiles'
        },
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
                function: 'distinctCount',
                arguments: [ { field: '~trips.id' } ]
              }
            ]
          },
          alias: 'passengersPerRecord'
        },
        {
          value: {
            function: 'divide',
            arguments: [
              {
                function: 'sum',
                arguments: [
                  { field: '~trips.data.miles' }
                ]
              },
              {
                function: 'sum',
                arguments: [
                  { field: 'data.passengers' }
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
    should(res).eql([
      {
        totalPassengers: 10860,
        passengersPerRecord: 2715,
        totalMiles: 788504,
        milesPerPassenger: 72.60626151012892
      }
    ])
  })
  it('should handle a non-geospatial join with required = true and groupings', async () => {
    const query = new AnalyticsQuery({
      joins: [ {
        name: 'Trips',
        alias: 'trips',
        required: true,
        filters: [
          {
            'data.route': { field: '~parent.data.route' },
            'data.year': { field: '~parent.data.year' }
          }
        ]
      } ],
      aggregations: [
        { alias: 'route', value: { field: 'data.route' } },
        {
          value: {
            function: 'sum',
            arguments: [
              { field: 'data.passengers' }
            ]
          },
          alias: 'totalPassengers'
        },
        {
          value: {
            function: 'sum',
            arguments: [
              { field: '~trips.data.miles' }
            ]
          },
          alias: 'totalMiles'
        },
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
                function: 'distinctCount',
                arguments: [ { field: '~trips.id' } ]
              }
            ]
          },
          alias: 'passengersPerRecord'
        },
        {
          value: {
            function: 'divide',
            arguments: [
              {
                function: 'sum',
                arguments: [
                  { field: '~trips.data.miles' }
                ]
              },
              {
                function: 'sum',
                arguments: [
                  { field: 'data.passengers' }
                ]
              }
            ]
          },
          alias: 'milesPerPassenger'
        }
      ],
      groupings: [
        { field: 'route' }
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
    should(res).eql([
      {
        route: 'A',
        totalPassengers: 3228,
        passengersPerRecord: 1614,
        totalMiles: 703302,
        milesPerPassenger: 217.87546468401487
      },
      {
        route: 'B',
        totalPassengers: 7632,
        passengersPerRecord: 3816,
        totalMiles: 85202,
        milesPerPassenger: 11.163784067085954
      }
    ])
  })

  it('should handle a join with no reference filter', async () => {
    const query = new AnalyticsQuery({
      joins: [ {
        name: 'Trips',
        alias: 'trips',
        filters: [
          {
            'data.year': 2019
          }
        ]
      } ],
      aggregations: [
        {
          value: {
            function: 'sum',
            arguments: [
              { field: 'data.passengers' }
            ]
          },
          alias: 'totalPassengers'
        },
        {
          value: {
            function: 'sum',
            arguments: [
              { field: '~trips.data.miles' }
            ]
          },
          alias: 'totalMiles'
        },
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
                function: 'distinctCount',
                arguments: [ { field: '~trips.id' } ]
              }
            ]
          },
          alias: 'passengersPerRecord'
        },
        {
          value: {
            function: 'divide',
            arguments: [
              {
                function: 'sum',
                arguments: [
                  { field: '~trips.data.miles' }
                ]
              },
              {
                function: 'sum',
                arguments: [
                  { field: 'data.passengers' }
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
    should(res).eql([
      {
        totalPassengers: 10860,
        passengersPerRecord: 2715,
        totalMiles: 788504,
        milesPerPassenger: 72.60626151012892
      }
    ])
  })

  it('should handle a sum inverted', async () => {
    const query = new AnalyticsQuery({
      joins: [ {
        name: 'Passengers',
        alias: 'passengers',
        filters: [
          {
            'data.year': { field: '~parent.data.year' }
          }
        ]
      } ],
      aggregations: [
        {
          value: {
            function: 'sum',
            arguments: [
              { field: '~passengers.data.passengers' }
            ]
          },
          alias: 'totalPassengers'
        },
        {
          value: {
            function: 'sum',
            arguments: [
              { field: 'data.miles' }
            ]
          },
          alias: 'totalMiles'
        },
        {
          value: {
            function: 'divide',
            arguments: [
              {
                function: 'sum',
                arguments: [
                  { field: '~passengers.data.passengers' }
                ]
              },
              {
                function: 'distinctCount',
                arguments: [ { field: 'id' } ]
              }
            ]
          },
          alias: 'passengersPerRecord'
        },
        {
          value: {
            function: 'divide',
            arguments: [
              {
                function: 'sum',
                arguments: [
                  { field: 'data.miles' }
                ]
              },
              {
                function: 'sum',
                arguments: [
                  { field: '~passengers.data.passengers' }
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
      subSchemas: { data: transitTrip.schema },
      joins: {
        passengers: {
          model: datum,
          subSchemas: { data: transitPassenger.schema }
        }
      }
    })

    query.constrain({
      where: [
        { sourceId: 'transit-trips' }
      ],
      joins: {
        passengers: {
          where: [
            { sourceId: 'transit-passengers' }
          ]
        }
      }
    })

    const res = await query.execute()
    should.exist(res)
    should(res).eql([
      {
        totalPassengers: 10860,
        passengersPerRecord: 2715,
        totalMiles: 788504,
        milesPerPassenger: 72.60626151012892
      }
    ])
  })

  it('should handle a join with no reference filter (all time)', async () => {
    const query = new AnalyticsQuery({
      joins: [ {
        name: 'Trips',
        alias: 'trips'
      } ],
      aggregations: [
        {
          value: {
            function: 'sum',
            arguments: [
              { field: 'data.passengers' }
            ]
          },
          alias: 'totalPassengers'
        },
        {
          value: {
            function: 'sum',
            arguments: [
              { field: '~trips.data.miles' }
            ]
          },
          alias: 'totalMiles'
        },
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
                function: 'distinctCount',
                arguments: [ { field: '~trips.id' } ]
              }
            ]
          },
          alias: 'passengersPerRecord'
        },
        {
          value: {
            function: 'divide',
            arguments: [
              {
                function: 'sum',
                arguments: [
                  { field: '~trips.data.miles' }
                ]
              },
              {
                function: 'sum',
                arguments: [
                  { field: 'data.passengers' }
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
    should(res).eql([
      {
        totalPassengers: 10860,
        passengersPerRecord: 1810,
        totalMiles: 950190,
        milesPerPassenger: 87.49447513812154
      }
    ])
  })
})
