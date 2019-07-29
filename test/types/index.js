import should from 'should'
import * as types from '../../src/types'

describe('Types', () => {
  it('should have a test func on each type', () => {
    should(typeof types.any.test).equal('function')
    should(typeof types.text.test).equal('function')
    should(typeof types.number.test).equal('function')
    should(typeof types.boolean.test).equal('function')
    should(typeof types.date.test).equal('function')
    should(typeof types.point.test).equal('function')
    should(typeof types.line.test).equal('function')
    should(typeof types.multiline.test).equal('function')
    should(typeof types.polygon.test).equal('function')
    should(typeof types.multipolygon.test).equal('function')
  })

  it('should have a cast func each type', () => {
    should(typeof types.any.cast).equal('function')
    should(typeof types.array.cast).equal('function')
    should(typeof types.text.cast).equal('function')
    should(typeof types.number.cast).equal('function')
    should(typeof types.boolean.cast).equal('function')
    should(typeof types.date.cast).equal('function')
    should(typeof types.point.cast).equal('function')
    should(typeof types.line.cast).equal('function')
    should(typeof types.multiline.cast).equal('function')
    should(typeof types.polygon.cast).equal('function')
    should(typeof types.multipolygon.cast).equal('function')
  })


  it('should test for any', () => {
    should(types.any.test('invalid')).equal(true)
  })

  it('should test for object', () => {
    should(types.object.test('str')).equal(false)
    should(types.object.test([])).equal(false)
    should(types.object.test({})).equal(true)
    should(types.object.test(new Object())).equal(true)
  })

  it('should test for text', () => {
    should(types.text.test([])).equal(false)
    should(types.text.test({})).equal(false)
    should(types.text.test(NaN)).equal(false)
    should(types.text.test('')).equal(true)
    should(types.text.test('str')).equal(true)
  })

  it('should test for number', () => {
    should(types.number.test([])).equal(false)
    should(types.number.test({})).equal(false)
    should(types.number.test(NaN)).equal(false)
    should(types.number.test(0)).equal(true)
    should(types.number.test(12)).equal(true)
  })

  it('should test for boolean', () => {
    should(types.boolean.test('test')).equal(false)
    should(types.boolean.test([])).equal(false)
    should(types.boolean.test({})).equal(false)
    should(types.boolean.test(NaN)).equal(false)
    should(types.boolean.test(true)).equal(true)
    should(types.boolean.test(false)).equal(true)
  })

  it('should have a geojson check for geo types', () => {
    should(types.point.test({})).equal(false)
    should(types.point.test({ type: 'invalid' })).equal(false)

    should(types.line.test({})).equal(false)
    should(types.line.test({ type: 'invalid' })).equal(false)

    should(types.multiline.test({})).equal(false)
    should(types.multiline.test({ type: 'invalid' })).equal(false)

    should(types.polygon.test({})).equal(false)
    should(types.polygon.test({ type: 'invalid' })).equal(false)

    should(types.multipolygon.test({})).equal(false)
    should(types.multipolygon.test({ type: 'invalid' })).equal(false)
  })

  it('should have a date check', () => {
    should(types.date.test({})).equal(false)
  })

  it('should cast any', () => {
    should(types.any.cast('asf')).equal('asf')
  })

  it('should cast array', () => {
    const t = types.array.cast('asf')
    should(t.fn).equal('fix_jsonb_array')
    should(t.args[0]).equal('asf')
  })

  it('should cast object', () => {
    const t = types.object.cast({ id: 'one' })
    should(t.type).equal('jsonb')
    should(t.val.id).equal('one')
  })

  it('should cast text', () => {
    const t = types.text.cast({ id: 'one' })
    should(t.id).equal('one')
  })

  it('should cast number', () => {
    const t = types.number.cast(123)
    should(t.type).equal('numeric')
    should(t.val).equal(123)
  })

  it('should cast boolean', () => {
    const t = types.boolean.cast(false)
    should(t.type).equal('boolean')
    should(t.val).equal(false)
  })

  it('should cast a date', () => {
    const d = '2019-07-29T15:57:02.156Z'
    should.throws(() => types.date.cast(''))
    const t1 = types.date.cast(d, { timezone: undefined })
    should(t1.fn).equal('parse_iso')
    should(t1.args[0]).equal(d)

    should.throws(() => types.date.cast(d, { timezone: 'invalid' }))

    const t2 = types.date.cast(d, { timezone: 'America/New_York' })
    should(t2.args).eql([
      d,
      'America/New_York'
    ])
  })

  it('should cast point', () => {
    const p = { type: 'Point', coordinates: [ 1, 2 ] }
    const t = types.point.cast(p)
    should(t.fn).equal('ST_GeomFromGeoJSON')
    should(t.args[0]).equal(p)
  })
})
