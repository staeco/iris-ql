import should from 'should'
import { Query } from '../../src'
import db from '../fixtures/db'

describe('Query#execute', () => {
  const { user, datum } = db.models
  it('should execute with count off', async () => {
    const query = new Query({ limit: 1 }, { model: user })
    const res = await query.execute({ count: false })
    should.exist(res)
    res.length.should.equal(1)
    should.exist(res[0].authToken)
  })
  it('should execute with scope', async () => {
    const query = new Query({ limit: 1 }, { model: user.scope('public') })
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(3)
    res.rows.length.should.equal(1)
    should.not.exist(res.rows[0].authToken)
  })
  it('should filter hour of day with timezone', async () => {
    const unfilteredQuery = new Query({
      limit: 4,
      timezone: 'America/New_York'
    }, {
      model: datum
    })
    const allRes = await unfilteredQuery.execute()
    should(allRes.count).equal(2)
    const filteredQuery = new Query({
      limit: 4,
      timezone: 'America/New_York',
      filters: [
        {
          $and: [
            { 'data.dispatchedAt': { $ne: null } },
            {
              function: 'gte',
              arguments: [
                {
                  function: 'extract',
                  arguments: [
                    'hour',
                    {
                      field: 'data.dispatchedAt'
                    }
                  ]
                },
                '20'
              ]
            },
            {
              function: 'lte',
              arguments: [
                {
                  function: 'extract',
                  arguments: [
                    'hour',
                    {
                      field: 'data.dispatchedAt'
                    }
                  ]
                },
                '20'
              ]
            }
          ]
        }
      ]
    }, {
      subSchemas: {
        data: {
          dispatchedAt: {
            type: 'date'
          }
        }
      },
      model: datum
    })
    const filteredRes = await filteredQuery.execute()
    should(filteredRes.count).equal(1)
  })
})
