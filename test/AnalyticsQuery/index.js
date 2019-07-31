import should from 'should'
import { AnalyticsQuery } from '../../src'
import db from '../fixtures/db'

describe('AnalyticsQuery', () => {
  const { user } = db.models
  it('should blow up on invalid options', async () => {
    should.throws(() => new AnalyticsQuery({ limit: 1, groupings: [ { field: 'name' } ] }, { table: null }))
    should.throws(() => new AnalyticsQuery({ limit: 1, groupings: [ { field: 'name' } ] }))
    should.throws(() => new AnalyticsQuery(null, { table: user }))
    should.throws(() => new AnalyticsQuery({ limit: 1 }, { table: user }))
  })
  it('should not be able to access out of scope variables', async () => {
    try {
      new AnalyticsQuery({
        aggregations: [
          {
            value: { function: 'count' },
            alias: 'count'
          },
          {
            value: { field: 'authToken' },
            alias: 'authToken'
          }
        ],
        groupings: [
          { field: 'authToken' }
        ]
      }, { table: user.scope('public') })
    } catch (err) {
      err.fields.should.eql([
        {
          path: [ 'aggregations', 1, 'value', 'field' ],
          value: 'authToken',
          message: 'Field does not exist.'
        },
        {
          path: [ 'groupings', 0, 'field' ],
          value: 'authToken',
          message: 'Field does not exist.'
        }
      ])
      return
    }
    throw new Error('Did not throw!')
  })
})
