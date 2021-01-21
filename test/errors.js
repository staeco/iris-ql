import should from 'should'
import getJSONField from '../src/util/getJSONField'
import db from './fixtures/db'

const dataType = {
  schema: {
    id: {
      type: 'text'
    }
  }
}

describe('errors', () => {
  const { user } = db.models

  it('should return errors with status', () => {
    try {
      getJSONField('noExist.id', { context: [ 'path' ], model: user, subSchemas: { data: dataType.schema } })
    } catch (err) {
      should(err.status).eql(400)
    }
  })

  it('should return errors with fields', () => {
    try {
      getJSONField('noExist.id', { context: [ 'path' ], model: user, subSchemas: { data: dataType.schema } })
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
      getJSONField('noExist.id', { context: [ 'path' ], model: user, subSchemas: { data: dataType.schema } })
    } catch (err) {
      should(err.toString()).eql(`
Error: Validation Error
Issues:
 - { path: [ 'path' ], value: 'noExist.id', message: 'Field does not exist: noExist' }
      `.trim())
    }
  })

  it('should allow removing specific field paths', () => {
    try {
      getJSONField('noExist.id', { context: [ 'test', 'path' ], model: user, subSchemas: { data: dataType.schema } })
    } catch (err) {
      should(err.fields).eql([
        {
          path: [ 'test', 'path' ],
          value: 'noExist.id',
          message: 'Field does not exist: noExist'
        }
      ])

      err.removePath([ 'test' ])

      should(err.isEmpty()).equal(true)
      should(err.fields).eql([])
    }
  })
})
