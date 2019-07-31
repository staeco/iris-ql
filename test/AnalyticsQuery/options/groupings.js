import should from 'should'
import { AnalyticsQuery } from '../../../src'
import db from '../../fixtures/db'

describe('AnalyticsQuery#options#groupings', () => {
  const { user } = db.models
  it('should execute with a field', async () => {
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
  it('should return grouping invalid field errors correctly', async () => {
    try {
      new AnalyticsQuery({
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
          { field: 'does-not-exist' }
        ]
      }, { table: user })
    } catch (err) {
      should.exist(err)
      should.exist(err.fields)
      err.fields.should.eql([ {
        path: [ 'groupings', 0, 'field' ],
        value: 'does-not-exist',
        message: 'Field does not exist.'
      } ])
      return
    }
    throw new Error('Did not throw!')
  })
  it('should return deep grouping value errors correctly', async () => {
    try {
      new AnalyticsQuery({
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
          {
            function: 'area',
            arguments: [ { field: 'yo' } ]
          }
        ]
      }, { table: user })
    } catch (err) {
      should.exist(err)
      should.exist(err.fields)
      err.fields.should.eql([ {
        path: [ 'groupings', 0, 'arguments', 0, 'field' ],
        value: 'yo',
        message: 'Field does not exist.'
      } ])
      return
    }
    throw new Error('Did not throw!')
  })
})
