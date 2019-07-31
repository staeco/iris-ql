import should from 'should'
import { AnalyticsQuery } from '../../src'
import db from '../fixtures/db'
import collect from 'get-stream'
import JSONStream from 'JSONStream'

const json = () => JSONStream.stringify('[', ',', ']')
json.contentType = 'application/json'
json.extension = 'json'

describe('AnalyticsQuery#executeStream', () => {
  const { user } = db.models
  it('should execute with scope', async () => {
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
    }, { model: user.scope('public') })
    const stream = await query.executeStream()
    const res = await collect.array(stream)
    res.length.should.equal(3)
  })
  it('should execute with transform', async () => {
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
    }, { model: user.scope('public') })
    const stream = await query.executeStream({
      transform: (v) => ({
        ...v,
        newName: v.name,
        name: undefined
      })
    })
    const res = await collect.array(stream)
    res.length.should.equal(3)
    should.exist(res[0].newName)
    should.not.exist(res[0].name)
  })
  it('should execute with format', async () => {
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
    }, { model: user.scope('public') })
    const stream = await query.executeStream({
      format: json
    })
    should(stream.contentType).eql(json.contentType)
    const res = await collect(stream)
    should(typeof res).eql('string')
    const parsed = JSON.parse(res)
    parsed.length.should.equal(3)
    should.exist(parsed[0].name)
  })
})
