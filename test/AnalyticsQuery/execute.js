import should from 'should'
import { AnalyticsQuery } from '../../src'
import db from '../fixtures/db'
import { crimeTimeSeries, crimePerOfficer } from '../fixtures/analytics'
import dataType from '../fixtures/911-call'

describe('AnalyticsQuery#execute', () => {
  const { user, datum } = db.models
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
    }, { model: user })
    const res = await query.execute()
    should.exist(res)
    res.length.should.eql(3)
    res[0].count.should.eql(1)
  })
  it('should get crime time series', async () => {
    const query = new AnalyticsQuery(crimeTimeSeries, { model: datum, subSchemas: { data: dataType.schema } })
    const res = await query.execute()
    should(res).eql([
      {
        total: 1,
        day: new Date('2017-05-17T00:00:00.000Z')
      },
      {
        total: 1,
        day: new Date('2017-05-15T00:00:00.000Z')
      }
    ])
  })
  it('should get crime per officer', async () => {
    const query = new AnalyticsQuery(crimePerOfficer, { model: datum, subSchemas: { data: dataType.schema } })
    const res = await query.execute()
    should(res).eql([
      { total: 2, pre70s: 0, weekly: 2, officer: 'Smith' },
      { total: 1, pre70s: 0, weekly: 1, officer: 'Johns' },
      { total: 1, pre70s: 0, weekly: 1, officer: 'Wyatt' }
    ])
  })
  it('should get crime time series with LA time zone', async () => {
    const query = new AnalyticsQuery(crimeTimeSeries, { timezone: 'America/Los_Angeles', model: datum, subSchemas: { data: dataType.schema } })
    const res = await query.execute()
    should(res).eql([
      {
        total: 1,
        day: new Date('2017-05-16T07:00:00.000Z')
      },
      {
        total: 1,
        day: new Date('2017-05-15T07:00:00.000Z')
      }
    ])
  })
})
