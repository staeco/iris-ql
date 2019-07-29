import should from 'should'
import { Connection, Query } from '../../src'
import db from '../fixtures/db'
import collect from 'get-stream'
import JSONStream from 'JSONStream'

const json = () => JSONStream.stringify('[', ',', ']')
json.contentType = 'application/json'
json.extension = 'json'

describe('Query#execute', () => {
  const conn = new Connection(db)
  const { user } = conn.tables()
  it('should execute with scope', async () => {
    const query = new Query({ limit: 1 }, { table: user.scope('public') })
    const stream = await query.executeStream()
    const res = await collect.array(stream)
    res.length.should.equal(1)
    should.not.exist(res[0].authToken)
    should.exist(res[0].name)
  })
  it('should execute with transform', async () => {
    const query = new Query({ limit: 1 }, { table: user })

    // without transform
    const stream = await query.executeStream()
    const res = await collect.array(stream)
    res.length.should.equal(1)
    should.exist(res[0].authToken)
    should.exist(res[0].name)

    // with transform
    const stream2 = await query.executeStream({
      transform: (v) => ({
        ...v,
        authToken: undefined
      })
    })
    const res2 = await collect.array(stream2)
    res2.length.should.equal(1)
    should.not.exist(res2[0].authToken)
    should.exist(res2[0].name)
  })
  it('should execute with format', async () => {
    const query = new Query({ limit: 1 }, { table: user.scope('public') })
    const stream = await query.executeStream({
      format: json
    })
    should(stream.contentType).eql(json.contentType)
    const res = await collect(stream)
    should(typeof res).eql('string')
    const parsed = JSON.parse(res)
    parsed.length.should.equal(1)
    should.not.exist(parsed[0].authToken)
    should.exist(parsed[0].name)
  })
})
