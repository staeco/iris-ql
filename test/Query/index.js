import should from 'should'
import { Connection, Query } from '../../src'
import db from '../fixtures/db'

describe('Query', () => {
  const conn = new Connection(db)
  const { user } = conn.tables()
  it('should blow up on invalid options', async () => {
    should.throws(() => new Query({ limit: 1 }, { table: null }))
    should.throws(() => new Query({ limit: 1 }))
    should.throws(() => new Query(null, { table: user }))
  })
})
