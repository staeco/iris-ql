import should from 'should'
import { AnalyticsQuery } from '../../src'
import db from '../fixtures/db'

describe('AnalyticsQuery#execute', () => {
  const { user } = db.models
  it('should throw on bad function', async () => {
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

    should.throws(() => query.update(null))
    should.throws(() => query.update(() => null))
  })
  it('should update with new where clauses', async () => {
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

    query.update((v) => ({
      ...v,
      where: [
        ...v.where,
        { createdAt: { $eq: null } }
      ]
    }))
    const res = await query.execute()
    should.exist(res)
    res.length.should.eql(0)
  })
})
