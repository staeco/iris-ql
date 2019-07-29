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

  it('should return json fields', () => {
    const t = getJSONField('settings.id', { table: user })
    should(t.val).equal('"user"."settings"#>>\'{id}\'')
  })

  it('should return json fields with datatype', () => {
    const t = getJSONField('settings.id', { table: user, dataType })
    should(t.val).equal('"user"."settings"#>>\'{id}\'')
  })

  it('should error if root field does not exist', () => {
    try {
      getJSONField('noExist.id', { context: [ 'path' ], table: user, dataType })
    } catch (err) {
      err.fields.should.eql([
        {
          path: [ 'path' ],
          value: 'noExist.id',
          message: 'Field does not exist: noExist'
        }
      ])
    }
  })

  it('should error if sub field does not exist', () => {
    try {
      getJSONField('settings.noExist', { context: [ 'path' ], table: user, dataType })
    } catch (err) {
      err.fields.should.eql([
        {
          path: [ 'path' ],
          value: 'settings.noExist',
          message: 'Field does not exist: settings.noExist'
        }
      ])
    }
  })
})