import should from 'should'
import stringArray from '../../../src/util/iffy/stringArray'

describe('util#iffy#stringArray', () => {
  it('should exist', () => {
    should(stringArray).not.be.null()
  })
  it('should create string array', () => {
    const sample = ['a', 'b', 'c', 'd', 'e', 'f']
    stringArray(sample).should.eql(sample)
    stringArray(sample.join(',')).should.eql(sample)
  })
})
