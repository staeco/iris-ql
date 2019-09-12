import should from 'should'
import number from '../../../src/util/iffy/number'

describe('util#iffy#number', () => {
  it('should exist', () => {
    should(number).not.be.null()
  })
  it('should process number', () => {
    number(5).should.eql(5)
  })
  it('should process number string', () => {
    number('256').should.eql(256)
  })
  it('should throw error on invalid number', () => {
    should.throws(() => number('fity'))
  })
})
