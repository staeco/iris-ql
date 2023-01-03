import should from 'should'
import { Query } from '../../../src'
import call from '../../fixtures/911-call'
import bikeTrip from '../../fixtures/bike-trip'
import transitPassenger from '../../fixtures/transit-passenger'
import db from '../../fixtures/db'
import { groupBy } from 'lodash'

describe('Query#joins', () => {
  const { datum } = db.models

  it('should handle a join with no groupings', async () => {
    const query = new Query({
      filters: [
        {
          sourceId: 'bike-trips'
        }
      ],
      joins: [ {
        name: '911 Calls',
        alias: 'calls',
        where: [
          { sourceId: '911-calls' }
        ]
      },
      {
        name: 'Transit Passengers',
        alias: 'transitPassengers',
        where: [
          { sourceId: 'transit-passengers' }
        ]
      } ]
    }, {
      model: datum,
      subSchemas: { data: bikeTrip.schema },
      joins: {
        calls: {
          model: datum,
          subSchemas: { data: call.schema }
        },
        transitPassengers: {
          model: datum,
          subSchemas: { data: transitPassenger.schema }
        }
      }
    })

    const res = await query.execute()
    should.exist(res)
    should(res.length).eql(10)

    // assert on number of results in join and verify _alias result column
    const aliasGroups = groupBy(res, '_alias')
    should(Object.keys(aliasGroups) == [ 'null', 'calls', 'transitPassengers' ])
    should(aliasGroups.null.length == 2)
    should(aliasGroups.calls.length == 2)
    should(aliasGroups.transitPassengers.length == 6)
  })
})
