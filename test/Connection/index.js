import should from 'should'
import { Connection } from '../../src'
import db from '../fixtures/db'

describe('Connection', () => {
  it('should blow up when missing options', async () => {
    should.throws(() => new Connection())
  })
  it('should construct from existing', async () => {
    should.exist(new Connection(db))
  })
})
