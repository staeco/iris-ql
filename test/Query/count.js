import should from 'should'
import { Query } from '../../src'
import db from '../fixtures/db'
import dataType from '../fixtures/bike-trip'

describe('Query#count', () => {
  const { user, datum } = db.models
  it('should count with scope', async () => {
    const query = new Query({ limit: 1 }, { model: user.scope('public') })
    const res = await query.count()
    should(res).equal(3)
  })
  it('should count with geometry substitutions', async () => {
    const query = new Query({
      limit: 1,
      filters: [
        { sourceId: 'bike-trips' },
        { 'data.path': { $ne: null } },
        {
          function: 'gte',
          arguments: [
            { function: 'length', arguments: [ { field: 'data.path' } ] },
            1
          ]
        }
      ]
    }, {
      model: datum,
      subSchemas: {
        data: dataType.schema
      },
      substitutions: {
        'data.path': 'geometry'
      }
    })
    const res = await query.count()
    should(res).equal(2)
  })
  it('should count with function substitutions', async () => {
    const query = new Query({
      limit: 1,
      filters: [
        { sourceId: 'bike-trips' },
        { 'data.path': { $ne: null } },
        {
          function: 'gte',
          arguments: [
            { function: 'length', arguments: [ { field: 'data.path' } ] },
            1
          ]
        }
      ]
    }, {
      model: datum,
      subSchemas: {
        data: dataType.schema
      },
      substitutions: (opt) => {
        should.exist(opt)
        should.exist(opt.subSchemas.data)
        return { 'data.path': 'geometry' }
      }
    })
    const res = await query.count()
    should(res).equal(2)
  })
  it('should filter hour of day with timezone', async () => {
    const unfilteredQuery = new Query({
      filters: { sourceId: '911-calls' },
      limit: 4,
      timezone: 'America/New_York'
    }, {
      model: datum
    })
    const allRes = await unfilteredQuery.count()
    should(allRes).equal(2)
    const filteredQuery = new Query({
      limit: 4,
      timezone: 'America/New_York',
      filters: [
        { sourceId: '911-calls' },
        {
          $and: [
            { 'data.dispatchedAt': { $ne: null } },
            {
              function: 'gte',
              arguments: [
                {
                  function: 'extract',
                  arguments: [
                    'hourOfDay',
                    {
                      field: 'data.dispatchedAt'
                    }
                  ]
                },
                20
              ]
            },
            {
              function: 'lte',
              arguments: [
                {
                  function: 'extract',
                  arguments: [
                    'hourOfDay',
                    {
                      field: 'data.dispatchedAt'
                    }
                  ]
                },
                20
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
    const filteredRes = await filteredQuery.count()
    should(filteredRes).equal(1)
  })
  it('should filter hour of day with LA timezone', async () => {
    const unfilteredQuery = new Query({
      filters: { sourceId: '911-calls' },
      limit: 4,
      timezone: 'America/Los_Angeles'
    }, {
      model: datum
    })
    const allRes = await unfilteredQuery.count()
    should(allRes).equal(2)
    const filteredQuery = new Query({
      limit: 4,
      timezone: 'America/Los_Angeles',
      filters: [
        { sourceId: '911-calls' },
        {
          $and: [
            { 'data.dispatchedAt': { $ne: null } },
            {
              function: 'gte',
              arguments: [
                {
                  function: 'extract',
                  arguments: [
                    'hourOfDay',
                    {
                      field: 'data.dispatchedAt'
                    }
                  ]
                },
                17
              ]
            },
            {
              function: 'lte',
              arguments: [
                {
                  function: 'extract',
                  arguments: [
                    'hourOfDay',
                    {
                      field: 'data.dispatchedAt'
                    }
                  ]
                },
                17
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
    const filteredRes = await filteredQuery.count()
    should(filteredRes).equal(1)
  })
})
