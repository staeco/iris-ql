import should from 'should'
import { AnalyticsQuery } from '../../src'
import db from '../fixtures/db'
import { crimeTimeSeries, crimePerOfficer } from '../fixtures/analytics'
import dataType from '../fixtures/911-call'

describe('AnalyticsQuery#getOutputSchema', () => {
  const { user, datum } = db.models
  it('should get a basic schema', async () => {
    const query = new AnalyticsQuery({
      aggregations: [
        {
          name: 'Total #',
          notes: 'Total number of users',
          value: { function: 'count' },
          alias: 'count'
        },
        {
          name: 'Username',
          notes: 'Their name',
          value: { field: 'name' },
          alias: 'name'
        }
      ],
      groupings: [
        { field: 'name' }
      ]
    }, { model: user })
    const res = query.getOutputSchema()
    should.exist(res)
    should(res).eql({
      count: {
        name: 'Total #',
        notes: 'Total number of users',
        type: 'number'
      },
      name: {
        name: 'Username',
        notes: 'Their name',
        type: 'text'
      }
    })
  })
  it('should get crime time series', async () => {
    const query = new AnalyticsQuery(crimeTimeSeries, { model: datum, subSchemas: { data: dataType.schema } })
    const res = query.getOutputSchema()
    should.exist(res)
    should(res).eql({
      day: {
        name: 'Day',
        type: 'date',
        measurement: {
          type: 'bucket',
          value: 'day'
        }
      },
      total: { name: 'Total', type: 'number' }
    })
  })
  it('should get crime per officer', async () => {
    const query = new AnalyticsQuery(crimePerOfficer, { model: datum, subSchemas: { data: dataType.schema } })
    const res = query.getOutputSchema()
    should.exist(res)
    should(res).eql({
      pre70s: { name: 'Pre70s', type: 'number' },
      weekly: { name: 'Weekly', type: 'number' },
      total: { name: 'Total', type: 'number' },
      officer: {
        name: 'Officer',
        type: 'text',
        validation: {
          required: true,
          notEmpty: true,
          maxLength: 2048
        }
      }
    })
  })
})
