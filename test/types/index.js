import should from 'should'
import * as types from '../../src/types'

describe('types', () => {
  it('should have a test func on each type', () => {
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
    should(types.number.test(1000)).equal(true)
    should(types.number.test(10000000000)).equal(true)
  })

  it('should test for boolean', () => {
    should(types.boolean.test('test')).equal(false)
    should(types.boolean.test([])).equal(false)
    should(types.boolean.test({})).equal(false)
    should(types.boolean.test(NaN)).equal(false)
    should(types.boolean.test(true)).equal(true)
    should(types.boolean.test(false)).equal(true)
  })

  it('should have a geojson test for geo types', () => {
    should(types.point.test({})).not.equal(true)
    should(types.point.test({ type: 'invalid' })).not.equal(true)

    should(types.line.test({})).not.equal(true)
    should(types.line.test({ type: 'invalid' })).not.equal(true)

    should(types.multiline.test({})).not.equal(true)
    should(types.multiline.test({ type: 'invalid' })).not.equal(true)

    should(types.polygon.test({})).not.equal(true)
    should(types.polygon.test({ type: 'invalid' })).not.equal(true)

    should(types.multipolygon.test({})).not.equal(true)
    should(types.multipolygon.test({ type: 'invalid' })).not.equal(true)
  })

  it('should have a date test', () => {
    should(types.date.test({})).equal(false)
    should(types.date.test(0)).equal(false)
    should(types.date.test(1000)).equal(false)
    should(types.date.test('1000')).equal(false)
    should(types.date.test('2019-07-29T15:57:02.156Z')).equal(true)
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
    const t1 = types.date.hydrate(d)
    should(t1.fn).equal('parse_iso')
    should(t1.args[0]).equal(d)
  })

  it('should hydrate point', () => {
    const p = { type: 'Point', coordinates: [ 1, 2 ] }
    const top = types.point.hydrate(p)
    should(top.fn).equal('ST_SetSRID')
    should(top.args[0].args[0]).equal(p)
  })
})
