import aggregateWithFilter from 'lib/query/aggregateWithFilter'
import parseFilter from 'lib/query/parseFilter'
import types from 'connections/postgres'
import { dataType, datum } from 'tables'
import should from 'should'

describe('lib#query#aggregateWithFilter', () => {
  it('should exist', () => {
    should(aggregateWithFilter).not.be.null()
    should(typeof aggregateWithFilter).equal('function')
  })
  it('should build aggregation', async () => {
    const issueType = await dataType.Model.findById('issue')
    const res = aggregateWithFilter({
      aggregation: types.fn('count', types.literal('*')),
      filters: parseFilter({
        [`data.notes`]: { $eq: 'squirrel' }
      },{
        dataType: issueType,
        table: datum
      }),
      table: datum
    })
    should(res.val).eql(`count(*) FILTER (WHERE ("datum"."data"#>>'{notes}') = 'squirrel')`)
  })
  it('should throw error without filters', () =>
    should.throws(() => parseFilter({
      aggregation: types.fn('count', types.literal('*')),
      table: datum
    })))
  it('should throw error without aggregation', async () => {
    const issueType = await dataType.Model.findById('issue')
    should.throws(() => parseFilter({
      filters: parseFilter({
        [`data.notes`]: { $eq: 'squirrel' }
      },{
        dataType: issueType,
        table: datum
      }),
      table: datum
    }))
  })
})
