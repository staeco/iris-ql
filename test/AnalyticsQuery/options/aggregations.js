import should from 'should'
import { Connection, AnalyticsQuery } from '../../../src'
import db from '../../fixtures/db'

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
    try {
      new AnalyticsQuery({
        aggregations: [
          {
            value: { function: 'count' },
            alias: 'count'
          },
          {
            value: { field: 'does-not-exist' },
            alias: 'name'
          }
        ],
        groupings: [
          { field: 'name' }
        ]
      }, { table: user })
    } catch (err) {
      should.exist(err)
      should.exist(err.fields)
      err.fields.should.eql([ {
        path: [ 'aggregations', 1, 'value', 'field' ],
        value: 'does-not-exist',
        message: 'Field does not exist.'
      } ])
      return
    }
    throw new Error('Did not throw!')
  })
})
