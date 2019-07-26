import should from 'should'
import getJSONField from '../../src/util/getJSONField'
import { Connection } from '../../src'
import db from '../fixtures/db'

const dataType = {
  schema: {
    id: {
      type: 'any'
    }
  }
}

describe('util#getJSONField', () => {
  const conn = new Connection(db)
  const { user } = conn.tables()

  it('should return error', () => {
    should.throws(() => getJSONField('id', {}))
    should.throws(() => getJSONField('settings.invalid', { table: user, dataType }))
  })

  it('should return json fields', () => {
    const t = getJSONField('settings.id', { table: user })
    should(t.val).equal('"user"."settings"#>>\'{id}\'')
  })

  it('should return json fields with datatype', () => {
    const t = getJSONField('settings.id', { table: user, dataType })
    should(t.val).equal('"user"."settings"#>>\'{id}\'')
  })
})
