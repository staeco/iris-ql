import should from 'should'
import types from 'sequelize'
import { Query } from '../../src'
import db from '../fixtures/db'
import collect from 'get-stream'
import JSONStream from 'JSONStream'
import pumpify from 'pumpify'
import through2 from 'through2'

const json = () => JSONStream.stringify('[', ',', ']')
json.contentType = 'application/json'
json.extension = 'json'

describe('Query#executeStream', () => {
  const { user, datum } = db.models
  it('should execute with scope', async () => {
    const query = new Query({ limit: 1 }, { model: user.scope('public') })
    const stream = await query.executeStream()
    const res = await collect.array(stream)
    res.length.should.equal(1)
    should.not.exist(res[0].authToken)
    should.exist(res[0].name)
  })
  it('should execute with transform', async () => {
    const query = new Query({ limit: 1 }, { model: user })

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
    const query = new Query({ limit: 1 }, { model: user.scope('public') })
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
  it('should work with format and pumpify', async () => {
    const query = new Query({ limit: 1 }, { model: user.scope('public') })
    const stream = await query.executeStream({
      format: json
    })
    should(stream.contentType).eql(json.contentType)
    const res = await collect(pumpify.obj(
      stream,
      through2()
    ))
    should(typeof res).eql('string')
    const parsed = JSON.parse(res)
    parsed.length.should.equal(1)
    should.not.exist(parsed[0].authToken)
    should.exist(parsed[0].name)
  })
  it('should execute with proper model name', async () => {
    const query = new Query({ limit: 1, filters: { sourceId: '911-calls' } }, { model: datum.scope('public') })
    const stream = await query.executeStream({
      format: json
    })
    should(stream.contentType).eql(json.contentType)
    const res = await collect(stream)
    should(typeof res).eql('string')
    const parsed = JSON.parse(res)
    parsed.length.should.equal(1)
    should.not.exist(parsed[0].updatedAt)
    should.exist(parsed[0].geometry)
    should(typeof parsed[0].geometry).equal('object')
    should(parsed[0].geometry.type).equal('Point')
  })
  it('should report errors correctly', async () => {
    const fauxTable = db.define('noExist', {
      id: {
        type: types.UUID,
        primaryKey: true,
        allowNull: false
      }
    }, {
      freezeTableName: true
    })

    const query = new Query({ limit: 1 }, { model: fauxTable })
    const stream = await query.executeStream({
      format: json
    })
    should(stream.contentType).eql(json.contentType)
    try {
      await collect(stream)
    } catch (err) {
      should(err.message).match('relation "noExist" does not exist')
      return
    }
    throw new Error('Did not throw!')
  })
})
