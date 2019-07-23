import should from 'should'
import { Connection } from '../src'
import db from './fixtures/db'

/*eslint no-console: 0, no-loops/no-loops: "off" */

describe('Connection', () => {
  it('should construct', async () => {
    should.exist(new Connection(db))
  })
  it('should seed', async () => {
    const conn = new Connection(db)
    await conn.seed()
  })
})
