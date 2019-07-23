import { Connection } from '../src'
import db from './fixtures/db'
import seedUsers from './fixtures/seed-users'

before(async () => {
  const conn = new Connection(db)
  await db.sync()
  await conn.seed()
  await seedUsers()
})
