import should from 'should'
import { where, value, jsonPath } from '../../src/util/toString'
import getJSONField from '../../src/util/getJSONField'
import { Connection } from '../../src'
import db from '../fixtures/db'

describe('util#toString', () => {
  const conn = new Connection(db)
  const { user } = conn.tables()

  it('should return a where string', () => {
    const t = where({ value: { id: '' }, table: user })
    should(t).equal(`"user"."id" = ''`)
  })

  it('should return a jsonPath string', () => {
    const t = jsonPath({ column: 'settings', table: user, path: 'settings.id' })
    should(t).equal(`"user"."settings"#>>'{settings,id}'`)
  })

  it('should return a value string', () => {
    const val = getJSONField('settings.id', { table: user })
    const t = value({ value: val, table: user })
    should(t).equal(`"user"."settings"#>>'{id}'`)
  })
})
