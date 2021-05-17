import should from 'should'
import { Query } from '../../src'
import db from '../fixtures/db'

describe('Query', () => {
  const { user } = db.models
  it('should blow up on invalid options', async () => {
    should.throws(() => new Query({ limit: 1 }, { model: null }))
    should.throws(() => new Query({ limit: 1 }))
    should.throws(() => new Query(null, { model: user }))
  })
  it('should not be able to access out of scope variables', async () => {
    try {
      new Query(
        {
          filters: {
            authToken: '123'
          }
        },
        { model: user.scope('public') }
      )
    } catch (err) {
      err.fields.should.eql([
        {
          path: ['filters', 'authToken'],
          value: 'authToken',
          message: 'Field does not exist.'
        }
      ])
      return
    }
    throw new Error('Did not throw!')
  })
})
