import { setup as setupTests } from '../src'
import db from './fixtures/db'
import seedUsers from './fixtures/seed-users'
import seedStores from './fixtures/seed-stores'
import seedData from './fixtures/seed-data'

before(async () => {
  await db.sync()
  await setupTests(db)
  await seedUsers()
  await seedStores()
  await seedData()
})
