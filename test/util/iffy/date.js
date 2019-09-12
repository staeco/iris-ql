import should from 'should'
import date from '../../../src/util/iffy/date'

describe('util#iffy#date', () => {
  it('should exist', () => {
    date.should.not.be.null()
  })
  it('should parse date', () => {
    should(date(95376520918).getTime()).eql(95376520918)
  })
  it('should throw on invalid date', () => {
    should.throws(() => date('bla bla bla'))
  })
})
