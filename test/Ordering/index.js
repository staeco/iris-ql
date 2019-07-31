import should from 'should'
import { Ordering } from '../../src'
import parse from '../../src/Ordering/parse'
import db from '../fixtures/db'

describe('Ordering', () => {
  const { user } = db.models
  it('should blow up on invalid options', async () => {
    should.throws(() => new Ordering())
    should.throws(() => new Ordering({}))
    should.throws(() => new Ordering({}, {}))
  })
  it('should blow up on invalid parsing options', async () => {
    should.throws(() => new Ordering({}, { model: true }))
    should.throws(() => new Ordering({}, { model: user }))
    should.throws(() => new Ordering({}, { model: user }).value())
    should.throws(() => new Ordering({ value: 'id', direction: NaN }, { model: user }).value())
    should.throws(() => new Ordering({ value: 'id' }, { model: user }).value())
    should.throws(() => new Ordering({ direction: 'asc' }, { model: user }).value())
    should.throws(() => new Ordering({ value: { function: 'wat' }, direction: 'asc' }, { model: user }).value())
  })
  it('should return an ordering query when valid', async () => {
    const t = new Ordering({ value: 'id', direction: 'asc' }, { model: user }).value()
    should(t[0].val).equal('\'id\'')
  })
})

describe('Ordering#parse', () => {

  const { user } = db.models
  it('should blow up on invalid options', async () => {
    should.throws(() => parse())
    should.throws(() => parse({}))
    should.throws(() => parse({}, {}))
  })
  it('should blow up on invalid parsing options', async () => {
    should.throws(() => parse({}, { model: true }))
    should.throws(() => parse({}, { model: user }))
    should.throws(() => parse({}, { model: user }).value())
    should.throws(() => parse({ value: 'id', direction: NaN }, { model: user }).value())
    should.throws(() => parse({ value: 'id' }, { model: user }).value())
    should.throws(() => parse({ direction: 'asc' }, { model: user }).value())
    should.throws(() => parse({ value: { function: 'wat' }, direction: 'asc' }, { model: user }).value())
  })
  it('should return an ordering query when valid', async () => {
    const t = parse({ value: 'id', direction: 'asc' }, { model: user })
    should(t[0].val).equal('\'id\'')
  })
})
