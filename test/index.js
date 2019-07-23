import { Connection } from '../src'
import db from './fixtures/db'
import seedUsers from './fixtures/seed-users'
import seedStores from './fixtures/seed-stores'

before(async () => {
  const conn = new Connection(db)
  await db.sync()
  await conn.seed()
  await seedUsers()
  await seedStores()
})
