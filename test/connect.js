import { connect } from '../src'
import should from 'should'

describe('connect', () => {
  it('should work with string', () => {
    should.exist(connect(`postgres://postgres@localhost:5432/dummy`))
  })
  it('should work with object', () => {
    should.exist(connect({ dialect: 'postgres' }))
  })
})
