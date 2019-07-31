import { setup } from '../src'
import db from './fixtures/db'

describe('setup', () => {
  it('should setup', async () => {
    await setup(db)
  })
})
