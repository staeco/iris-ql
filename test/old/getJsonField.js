import getJsonField from 'lib/query/getJsonField'
import { dataType, datum } from 'tables'
import should from 'should'

describe('lib#query#getJsonField', () => {
  it('should exist', () => {
    should(getJsonField).not.be.null()
  })
  it('should find json field', async () => {
    const issueType = await dataType.Model.findById('issue')
    const res = getJsonField('type.notes', // string json selection path
      {
        dataType: issueType,
        table: datum
      })
    should(res.val).eql(`"datum"."type"#>>'{notes}'`)
  })
  it('should throw error on field outside of limits', async () => {
    const issueType = await dataType.Model.findById('issue')
    should.throws(() => getJsonField('schema', {
      dataType: issueType,
      table: datum,
      fieldLimit: [ 'name', 'createdAt', 'updatedAt' ] // list of fields to choose from
    }))
  })
  it('should throw error on non-existent field', async () => {
    const issueType = await dataType.Model.findById('issue')
    should.throws(() => getJsonField('type.schema', {
      dataType: issueType,
      table: datum
    }))
  })
})
