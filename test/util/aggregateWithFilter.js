import should from 'should'
import aggregateWithFilter from '../../src/util/aggregateWithFilter'
import { Aggregation, Filter } from '../../src'
import db from '../fixtures/db'

describe('util#aggregateWithFilter', () => {
  const { user } = db.models

  const agg = new Aggregation(
    {
      value: { function: 'now' },
      alias: 'now'
    },
    { model: user }
  )

  it('should throw without opts', () => {
    should.throws(() => aggregateWithFilter({}))
    should.throws(() =>
      aggregateWithFilter({ filters: undefined, model: user })
    )
    should.throws(() =>
      aggregateWithFilter({ aggregation: undefined, filters: [], model: user })
    )
    should.throws(() => aggregateWithFilter({ aggregation: agg, model: user }))
  })

  it('should return aggregation', () => {
    const filters = new Filter({ name: { $ne: null } }, { model: user })

    const t = aggregateWithFilter({ aggregation: agg, filters, model: user })
    should(t.val).equal('[object Object] FILTER (WHERE 1=1)')
  })
})
