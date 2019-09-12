import should from 'should'
import getJSONField from '../../src/util/getJSONField'
import db from '../fixtures/db'

const dataType = {
  schema: {
    id: {
      type: 'text'
    }
  }
}

describe('util#getJSONField', () => {
  const { user } = db.models

  it('should return json fields', () => {
    const t = getJSONField('settings.id', { model: user, subSchemas: { settings: dataType.schema } })
    should(t.val).equal('"user"."settings"#>>\'{id}\'')
  })

  it('should return json fields with subSchema', () => {
    const t = getJSONField('settings.id', { model: user, subSchemas: { settings: dataType.schema } })
    should(t.val).equal('"user"."settings"#>>\'{id}\'')
  })

  it('should error if root field does not exist', () => {
    try {
      getJSONField('noExist.id', { context: [ 'path' ], model: user, subSchemas: { settings: dataType.schema } })
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

  it('should error if primary field subschema does not exist', () => {
    try {
      getJSONField('settings.noExist', { context: [ 'path' ], model: user })
    } catch (err) {
      err.fields.should.eql([
        {
          path: [ 'path' ],
          value: 'settings.noExist',
          message: 'Field is not queryable: settings'
        }
      ])
    }
  })

  it('should error if sub field does not exist', () => {
    try {
      getJSONField('settings.noExist', { context: [ 'path' ], model: user, subSchemas: { settings: dataType.schema } })
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
