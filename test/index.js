import { setup } from '../src'
import db from './fixtures/db'
import seedUsers from './fixtures/seed-users'
import seedStores from './fixtures/seed-stores'
import seedData from './fixtures/seed-data'

before(async () => {
  await db.sync()
  await setup(db)
  await seedUsers()
  await seedStores()
  await seedData()
})
