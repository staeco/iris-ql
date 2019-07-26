import should from 'should'
import { Connection, AnalyticsQuery } from '../../src'
import db from '../fixtures/db'

describe('AnalyticsQuery#execute', () => {
  const conn = new Connection(db)
  const { user } = conn.tables()
  it('should execute', async () => {
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
    }, { table: user })
    const res = await query.execute()
    should.exist(res)
    res.length.should.eql(3)
    res[0].count.should.eql(1)
  })
  it('should return aggregation errors correctly', async () => {
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
    }, { table: user })
    const res = await query.execute()
    should.exist(res)
    console.log(res)
  })
})
