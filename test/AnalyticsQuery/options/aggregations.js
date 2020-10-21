import should from 'should'
import { AnalyticsQuery } from '../../../src'
import db from '../../fixtures/db'
import dataType from '../../fixtures/911-call'

describe('AnalyticsQuery#options#aggregations', () => {
  const { user, datum } = db.models
  it('should execute a basic query', async () => {
    const query = new AnalyticsQuery({
      aggregations: [
        {
          value: { function: 'count' },
          alias: 'count',
          filters: {
            createdAt: { $gte: { function: 'last', arguments: [ 'P1W' ] } }
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
    }, { model: user })
    const res = await query.execute()
    should.exist(res)
    res.length.should.eql(3)
    res[0].count.should.eql(1)
  })
  it('should execute a query with nested aggregations', async () => {
    const query = new AnalyticsQuery({
      aggregations: [
        {
          value: { function: 'count' },
          alias: 'count',
          filters: {
            createdAt: { $gte: { function: 'last', arguments: [ 'P1W' ] } }
          }
        },
        {
          value: { field: 'name' },
          alias: 'name'
        },
        {
          value: {
            function: 'average',
            arguments: [
              {
                function: 'interval',
                arguments: [
                  { function: 'last', arguments: [ 'P1W' ] },
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
    }, { model: user })
    const res = await query.execute()
    should.exist(res)
    res.length.should.eql(3)
    should(typeof res[0].timeSpent).eql('number')
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
      }, { model: user })
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
            alias: 'test'
          }
        ],
        groupings: [
          { field: 'test' }
        ]
      }, { model: user })
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
      }, { model: user })
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
  it('should return errors when a field aggregation is not a grouping', async () => {
    try {
      new AnalyticsQuery({
        aggregations: [
          {
            value: { function: 'count' },
            alias: 'count',
            filters: {
              createdAt: { $gte: { function: 'last', arguments: [ 'P1W' ] } }
            }
          },
          {
            value: { field: 'name' },
            alias: 'name'
          }
        ]
      }, { model: user })
    } catch (err) {
      should.exist(err)
      should.exist(err.fields)
      err.fields.should.eql([ {
        path: [ 'aggregations', 1, 'value' ],
        value: { field: 'name' },
        message: 'Must contain an aggregation.'
      } ])
      return
    }
    throw new Error('Did not throw!')
  })
  it('should return errors for duplicate aggregation', async () => {
    try {
      new AnalyticsQuery({
        aggregations: [
          {
            value: { function: 'count' },
            alias: 'count',
            filters: {
              createdAt: { $gte: { function: 'last', arguments: [ 'P1W' ] } }
            }
          },
          {
            value: { field: 'name' },
            alias: 'name'
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
    } catch (err) {
      should.exist(err)
      should.exist(err.fields)
      err.fields.should.eql([ {
        path: [ 'aggregations', 2, 'alias' ],
        value: 'name',
        message: 'Duplicate aggregation.'
      } ])
      return
    }
    throw new Error('Did not throw!')
  })
  it('should handle conflicting variables in aggregations', async () => {
    try {
      new AnalyticsQuery({
        filters: {
          sourceId: '911-calls'
        },
        aggregations: [
          {
            value: { function: 'count' },
            alias: 'count'
          },
          {
            value: { field: 'data.id' },
            alias: 'id'
          }
        ],
        orderings: [
          { value: { field: 'data.receivedAt' }, direction: 'asc' }
        ],
        groupings: [
          { field: 'id' }
        ]
      }, { model: datum, subSchemas: { data: dataType.schema } })
    } catch (err) {
      should.exist(err)
      should.exist(err.fields)
      err.fields.should.eql([ {
        path: [ 'groupings', 0, 'field' ],
        value: 'id',
        message: 'Field is ambigous - exists as both a column and an aggregation.'
      } ])
      return
    }
    throw new Error('Did not throw!')
  })
})
