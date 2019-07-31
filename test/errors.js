import should from 'should'
import getJSONField from '../src/util/getJSONField'
import { Connection } from '../src'
import db from './fixtures/db'

const dataType = {
  schema: {
    id: {
      type: 'any'
    }
  }
}

describe('errors', () => {
  const conn = new Connection(db)
  const { user } = conn.tables()

  it('should return errors with status', () => {
    try {
      getJSONField('noExist.id', { context: [ 'path' ], table: user, subSchemas: { data: dataType.schema } })
    } catch (err) {
      should(err.status).eql(400)
    }
  })

  it('should return errors with fields', () => {
    try {
      getJSONField('noExist.id', { context: [ 'path' ], table: user, subSchemas: { data: dataType.schema } })
    } catch (err) {
      should(err.fields).eql([
        {
          path: [ 'path' ],
          value: 'noExist.id',
          message: 'Field does not exist: noExist'
        }
      ])
    }
  })

  it('should return serializable errors', () => {
    try {
      getJSONField('noExist.id', { context: [ 'path' ], table: user, subSchemas: { data: dataType.schema } })
    } catch (err) {
      should(err.toString()).eql(`
Error: Bad Request
Issues:
 - { path: [ 'path' ], value: 'noExist.id', message: 'Field does not exist: noExist' }
      `.trim())
    }
  })
})
