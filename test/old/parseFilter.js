import parseFilter from 'lib/query/parseFilter'
import { dataType, datum } from 'tables'
import should from 'should'

describe('lib#query#parseFilter', () => {
  it('should exist', () => {
    should(parseFilter).not.be.null()
  })
  it('should parse not equal filter', async () => {
    const issueType = await dataType.Model.findById('issue')
    //insert data into source
    const res = parseFilter({
      [`data.notes`]: { $ne: null }
    },{
      dataType: issueType,
      table: datum
    })
    should(res.val).eql(`("datum"."data"#>>'{notes}') IS NOT NULL`)
  })
  it('should parse equal filter', async () => {
    const issueType = await dataType.Model.findById('issue')
    //insert data into source
    const res = parseFilter({
      [`data.notes`]: { $eq: 'squirrel' }
    },{
      dataType: issueType,
      table: datum
    })
    should(res.val).eql(`("datum"."data"#>>'{notes}') = 'squirrel'`)
  })
})
