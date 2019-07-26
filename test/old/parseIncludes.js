import parseIncludes from 'lib/query/parseIncludes'
import { dataType } from 'tables'
import should from 'should'

const c = (v) => JSON.parse(JSON.stringify(v)) // remove proptype info

describe('lib#query#parseIncludes', () => {
  it('should exist', () => {
    should(parseIncludes).not.be.null()
    should(typeof parseIncludes).equal('function')
  })
  it('should return empty for empty includes', () => {
    should(parseIncludes([] , {})).eql([])
  })
  it('should return includes if they match schema', () => {
    should(c(parseIncludes([
      { resource: 'user' }
    ], {
      table: dataType
    }))).eql([ { as: 'user' } ])
  })
  it('should throw on invalid include', () =>
    should.throws(() => parseIncludes([
      { resource: 'place' } // invalid include for a dataType
    ], {
      table: dataType
    })))
})
