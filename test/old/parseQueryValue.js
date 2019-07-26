import parseQueryValue from 'lib/query/parseQueryValue'
import { dataType } from 'tables'
import should from 'should'

const c = (v) => JSON.parse(JSON.stringify(v))

describe('lib#query#parseQueryValue', () => {
  it('should parse value', async () => {
    const issueType = await dataType.Model.findById('issue')
    const res = c(parseQueryValue({ function: 'count' }, issueType))
    should(res).eql({
      fn: 'count',
      args: [ { val: '*' } ]
    })
  })
})
