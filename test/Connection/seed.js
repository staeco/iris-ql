import { Connection } from '../../src'
import db from '../fixtures/db'

describe('Connection#seed', () => {
  it('should seed', async () => {
    const conn = new Connection(db)
    await conn.seed()
  })
})
