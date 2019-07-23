import should from 'should'
import { Connection } from '../../src'
import db from '../fixtures/db'

describe('Connection', () => {
  it('should construct', async () => {
    should.exist(new Connection(db))
  })
})
