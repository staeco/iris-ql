import should from 'should'
import { AnalyticsQuery } from '../../src'
import db from '../fixtures/db'

describe('AnalyticsQuery#constrain', () => {
  const { user } = db.models
  it('should throw on bad where', async () => {
    const query = new AnalyticsQuery({
      aggregations: [
        {
          value: { function: 'count' },
          alias: 'count'
        },
        {
          value: { field: 'name' },
          alias: 'name'
        }
      ],
      groupings: [
        { field: 'name' }
      ]
    }, { model: user })

    should.throws(() => query.constrain({ where: 1 }))
  })
  it('should constrain with new where', async () => {
    const query = new AnalyticsQuery({
      aggregations: [
        {
          value: { function: 'count' },
          alias: 'count'
        },
        {
          value: { field: 'name' },
          alias: 'name'
        }
      ],
      groupings: [
        { field: 'name' }
      ]
    }, { model: user })

    query.constrain({
      where: [ { createdAt: { $eq: null } } ]
    })

    const res = await query.execute()
    should.exist(res)
    res.length.should.eql(0)
  })
})
