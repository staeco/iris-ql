import should from 'should'
import { Query } from '../../src'
import db from '../fixtures/db'
import dataType from '../fixtures/bike-trip'

describe('Query#execute', () => {
  const { user, datum } = db.models
  it('should report invalid timezone', async () => {
    try {
      new Query({ limit: 1, timezone: 'abcdefg' }, { model: user })
    } catch (err) {
      err.fields.should.eql([
        {
          path: ['timezone'],
          value: 'abcdefg',
          message: 'Not a valid timezone.'
        }
      ])
      return
    }
    throw new Error('Did not throw!')
  })
  it('should report invalid customYearStart', async () => {
    try {
      new Query({ limit: 1, customYearStart: 100 }, { model: user })
    } catch (err) {
      err.fields.should.eql([
        { path: ['customYearStart'], value: 100, message: 'Not a valid month.' }
      ])
      return
    }
    throw new Error('Did not throw!')
  })
  it('should execute with count off', async () => {
    const query = new Query({ limit: 1 }, { model: user, count: false })
    const res = await query.execute()
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
  it('should execute with geometry substitutions', async () => {
    const query = new Query(
      {
        limit: 1,
        filters: [
          { sourceId: 'bike-trips' },
          { 'data.path': { $ne: null } },
          {
            function: 'gte',
            arguments: [
              { function: 'length', arguments: [{ field: 'data.path' }] },
              1
            ]
          }
        ]
      },
      {
        model: datum,
        subSchemas: {
          data: dataType.schema
        },
        substitutions: {
          'data.path': 'geometry'
        }
      }
    )
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(2)
    res.rows.length.should.equal(1)
  })
  it('should execute with function substitutions', async () => {
    const query = new Query(
      {
        limit: 1,
        filters: [
          { sourceId: 'bike-trips' },
          { 'data.path': { $ne: null } },
          {
            function: 'gte',
            arguments: [
              { function: 'length', arguments: [{ field: 'data.path' }] },
              1
            ]
          }
        ]
      },
      {
        model: datum,
        subSchemas: {
          data: dataType.schema
        },
        substitutions: (opt) => {
          should.exist(opt)
          should.exist(opt.subSchemas.data)
          return { 'data.path': 'geometry' }
        }
      }
    )
    const res = await query.execute()
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(2)
    res.rows.length.should.equal(1)
  })
  it('should filter hour of day with timezone', async () => {
    const unfilteredQuery = new Query(
      {
        filters: { sourceId: '911-calls' },
        limit: 4,
        timezone: 'America/New_York'
      },
      {
        model: datum
      }
    )
    const allRes = await unfilteredQuery.execute()
    should(allRes.count).equal(2)
    const filteredQuery = new Query(
      {
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
      },
      {
        subSchemas: {
          data: {
            dispatchedAt: {
              type: 'date'
            }
          }
        },
        model: datum
      }
    )
    const filteredRes = await filteredQuery.execute({ raw: true })
    should(filteredRes.count).equal(1)
    should(filteredRes.rows[0].data.arrivedAt).eql('2017-05-17T00:24:09.649Z')
  })
  it('should filter hour of day with LA timezone', async () => {
    const unfilteredQuery = new Query(
      {
        filters: { sourceId: '911-calls' },
        limit: 4,
        timezone: 'America/Los_Angeles'
      },
      {
        model: datum
      }
    )
    const allRes = await unfilteredQuery.execute()
    should(allRes.count).equal(2)
    const filteredQuery = new Query(
      {
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
      },
      {
        subSchemas: {
          data: {
            dispatchedAt: {
              type: 'date'
            }
          }
        },
        model: datum
      }
    )
    const filteredRes = await filteredQuery.execute({ raw: true })
    should(filteredRes.count).equal(1)
    should(filteredRes.rows[0].data.arrivedAt).eql('2017-05-17T00:24:09.649Z')
  })
  it('should work with timeout', async () => {
    const query = new Query({ limit: 1 }, { model: user.scope('public') })
    const res = await query.execute({ timeout: 10000 })
    should.exist(res.count)
    should.exist(res.rows)
    res.count.should.equal(3)
    res.rows.length.should.equal(1)
    should.not.exist(res.rows[0].authToken)
  })
})
