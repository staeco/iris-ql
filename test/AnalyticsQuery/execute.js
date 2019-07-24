import should from 'should'
import { Connection, AnalyticsQuery } from '../../src'
import db from '../fixtures/db'

describe.skip('AnalyticsQuery#execute', () => {
  const conn = new Connection(db)
  const { user } = conn.tables()
  it('should execute with count off', async () => {
    const query = new AnalyticsQuery({ groupings: [ { field: 'name' } ] }, user)
    const res = await query.execute({ count: false })
    should.exist(res)
    console.log(res)
  })
})
