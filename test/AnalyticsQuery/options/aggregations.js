import should from 'should'
import { AnalyticsQuery } from '../../../src'
import db from '../../fixtures/db'

describe('AnalyticsQuery#options#aggregations', () => {
  const { user } = db.models
  it('should execute a basic query', async () => {
    const query = new AnalyticsQuery({
      aggregations: [
        {
          value: { function: 'count' },
          alias: 'count',
          filters: {
            createdAt: { $gte: { function: 'lastWeek' } }
          }
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
  it('should execute a query with casting', async () => {
    const query = new AnalyticsQuery({
      aggregations: [
        {
          value: { function: 'count' },
          alias: 'count',
          filters: {
            createdAt: { $gte: { function: 'lastWeek' } }
          }
        },
        {
          value: { field: 'name' },
          alias: 'name'
        },
        {
          value: {
            function: 'average',
            as: 'text',
            arguments: [
              {
                function: 'ms',
                arguments: [
                  { field: 'createdAt' }
                ]
              }
            ]
          },
          alias: 'timeSpent'
        }
      ],
      groupings: [
        { field: 'name' }
      ]
    }, { table: user })
    const res = await query.execute()
    should.exist(res)
    res.length.should.eql(3)
    should(typeof res[0].timeSpent).eql('string')
  })
  it('should return aggregation invalid alias errors correctly', async () => {
    try {
      new AnalyticsQuery({
        aggregations: [
          {
            value: { function: 'count' },
            alias: 'count'
          },
          {
            value: { field: 'name' },
            alias: {}
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
        path: [ 'aggregations', 1, 'alias' ],
        value: {},
        message: 'Must be a string.'
      } ])
      return
    }
    throw new Error('Did not throw!')
  })
  it('should return aggregation value errors correctly', async () => {
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
  it('should return deep aggregation value errors correctly', async () => {
    try {
      new AnalyticsQuery({
        aggregations: [
          {
            value: {
              function: 'area',
              arguments: [
                { field: 'yo' }
              ]
            },
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
    } catch (err) {
      should.exist(err)
      should.exist(err.fields)
      err.fields.should.eql([ {
        path: [ 'aggregations', 0, 'value', 'arguments', 0, 'field' ],
        value: 'yo',
        message: 'Field does not exist.'
      } ])
      return
    }
    throw new Error('Did not throw!')
  })
})
