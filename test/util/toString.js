import should from 'should'
import { where, value, jsonPath } from '../../src/util/toString'
import getJSONField from '../../src/util/getJSONField'
import db from '../fixtures/db'

const dataType = {
  schema: {
    id: {
      type: 'any'
    }
  }
}

describe('util#toString', () => {
  const { user } = db.models

  it('should return a where string', () => {
    const t = where({ value: { id: '' }, model: user })
    should(t).equal(`"user"."id" = ''`)
  })

  it('should return a jsonPath string', () => {
    const t = jsonPath({ column: 'settings', model: user, path: 'settings.id' })
    should(t).equal(`"user"."settings"#>>'{settings,id}'`)
  })

  it('should return a value string', () => {
    const val = getJSONField('settings.id', { model: user, subSchemas: { settings: dataType.schema } })
    const t = value({ value: val, model: user })
    should(t).equal(`"user"."settings"#>>'{id}'`)
  })
})
