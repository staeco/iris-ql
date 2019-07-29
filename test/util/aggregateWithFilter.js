import should from 'should'
import aggregateWithFilter from '../../src/util/aggregateWithFilter'
import { Connection, Aggregation, Filter } from '../../src'
import db from '../fixtures/db'

describe('util#aggregateWithFilter', () => {
  const conn = new Connection(db)
  const { user } = conn.tables()

  const agg = new Aggregation({
    value: { function: 'now' },
    alias: 'now'
  }, { table: user })

  it('should throw without opts', () => {
    should.throws(() => aggregateWithFilter({}))
    should.throws(() => aggregateWithFilter({ filters: undefined, table: user }))
    should.throws(() => aggregateWithFilter({ aggregation: undefined, filters: [], table: user }))
    should.throws(() => aggregateWithFilter({ aggregation: agg, table: user }))
  })

  it('should return aggregation', () => {
    const filters = new Filter({ name: { $ne: null } }, { table: user })

    const t = aggregateWithFilter({ aggregation: agg, filters, table: user })
    should(t.val).equal('[object Object] FILTER (WHERE 1=1)')
  })
})