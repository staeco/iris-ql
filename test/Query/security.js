import should from 'should'
import { Connection, Query } from '../../src'
import db from '../fixtures/db'

const filterRes = [
  { settings: { '%; union select authToken': 1 } },
  { authToken: { $eq: 'test' } },
  { settingsb: { "a')) AS DECIMAL0 = UNION SELECT VERSION(); --": 1 } }
]
const searchRes = [
  "') union select authToken from users ->>'id'::json %",
  "') union select authToken from users -- %",
  '%; union select authToken',
  'test%; UNION SELECT * FROM "users" --',
  '/*%; drop table users',
  '/*%; drop table users',
  `[]/*%; drop table users""`
]
const searchError = [
  '\''
  // { authToken: { $eq: 'test' } }
]

describe('Query#security', () => {
  const conn = new Connection(db)
  const { user } = conn.tables()

  filterRes.forEach((param, k) => {
    it(`should not return results for filter injections ${k}`, async () => {
      const query = new Query({ filters: param }, { table: user.scope('public') })
      const res = await query.execute()
      should(res.rows.length).equal(0)
    })
  })

  searchRes.forEach((param, k) => {
    it(`should not return results for search injections ${k}`, async () => {
      const query = new Query({ search: param }, { table: user })
      const res = await query.execute()
      should(res.rows.length).equal(0)
    })
  })

  searchError.forEach((param, k) => {
    it(`should return error for search injections ${k}`, async () => {
      should.throws(() => new Query({ filters: param }, { table: user.scope('public') }))
    })
  })
})
