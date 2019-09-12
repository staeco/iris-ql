import should from 'should'
import * as types from '../../src/types'

describe('types', () => {
  it('should have a check func on each type', () => {
    should(typeof types.text.check).equal('function')
    should(typeof types.number.check).equal('function')
    should(typeof types.boolean.check).equal('function')
    should(typeof types.date.check).equal('function')
    should(typeof types.point.check).equal('function')
    should(typeof types.line.check).equal('function')
    should(typeof types.multiline.check).equal('function')
    should(typeof types.polygon.check).equal('function')
    should(typeof types.multipolygon.check).equal('function')
  })

  it('should have a hydrate func each type', () => {
    should(typeof types.array.hydrate).equal('function')
    should(typeof types.text.hydrate).equal('function')
    should(typeof types.number.hydrate).equal('function')
    should(typeof types.boolean.hydrate).equal('function')
    should(typeof types.date.hydrate).equal('function')
    should(typeof types.point.hydrate).equal('function')
    should(typeof types.line.hydrate).equal('function')
    should(typeof types.multiline.hydrate).equal('function')
    should(typeof types.polygon.hydrate).equal('function')
    should(typeof types.multipolygon.hydrate).equal('function')
  })

  it('should check for object', () => {
    should(types.object.check('str')).equal(false)
    should(types.object.check([])).equal(false)
    should(types.object.check({})).equal(true)
    should(types.object.check(new Object())).equal(true)
  })

  it('should check for text', () => {
    should(types.text.check([])).equal(false)
    should(types.text.check({})).equal(false)
    should(types.text.check(NaN)).equal(false)
    should(types.text.check('')).equal(true)
    should(types.text.check('str')).equal(true)
  })

  it('should check for number', () => {
    should(types.number.check([])).equal(false)
    should(types.number.check({})).equal(false)
    should(types.number.check(NaN)).equal(false)
    should(types.number.check(0)).equal(true)
    should(types.number.check(12)).equal(true)
  })

  it('should check for boolean', () => {
    should(types.boolean.check('check')).equal(false)
    should(types.boolean.check([])).equal(false)
    should(types.boolean.check({})).equal(false)
    should(types.boolean.check(NaN)).equal(false)
    should(types.boolean.check(true)).equal(true)
    should(types.boolean.check(false)).equal(true)
  })

  it('should have a geojson check for geo types', () => {
    should(types.point.check({})).equal(false)
    should(types.point.check({ type: 'invalid' })).equal(false)

    should(types.line.check({})).equal(false)
    should(types.line.check({ type: 'invalid' })).equal(false)

    should(types.multiline.check({})).equal(false)
    should(types.multiline.check({ type: 'invalid' })).equal(false)

    should(types.polygon.check({})).equal(false)
    should(types.polygon.check({ type: 'invalid' })).equal(false)

    should(types.multipolygon.check({})).equal(false)
    should(types.multipolygon.check({ type: 'invalid' })).equal(false)
  })

  it('should have a date check', () => {
    should(types.date.check({})).equal(false)
  })

  it('should hydrate array', () => {
    const t = types.array.hydrate('asf')
    should(t.fn).equal('fix_jsonb_array')
    should(t.args[0]).equal('asf')
  })

  it('should hydrate object', () => {
    const t = types.object.hydrate({ id: 'one' })
    should(t.type).equal('jsonb')
    should(t.val.id).equal('one')
  })

  it('should hydrate text', () => {
    const t = types.text.hydrate({ id: 'one' })
    should(t.id).equal('one')
  })

  it('should hydrate number', () => {
    const t = types.number.hydrate(123)
    should(t.type).equal('numeric')
    should(t.val).equal(123)
  })

  it('should hydrate boolean', () => {
    const t = types.boolean.hydrate(false)
    should(t.type).equal('boolean')
    should(t.val).equal(false)
  })

  it('should hydrate a date', () => {
    const d = '2019-07-29T15:57:02.156Z'
    should.throws(() => types.date.hydrate(''))
    const t1 = types.date.hydrate(d, { timezone: undefined })
    should(t1.fn).equal('parse_iso')
    should(t1.args[0]).equal(d)

    should.throws(() => types.date.hydrate(d, { timezone: 'invalid' }))

    const t2 = types.date.hydrate(d, { timezone: 'America/New_York' })
    should(t2.fn).equal('force_tz')
  })

  it('should hydrate point', () => {
    const p = { type: 'Point', coordinates: [ 1, 2 ] }
    const t = types.point.hydrate(p)
    should(t.fn).equal('ST_GeomFromGeoJSON')
    should(t.args[0]).equal(p)
  })
})
