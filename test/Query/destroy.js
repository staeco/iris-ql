import should from 'should'
import { Query } from '../../src'
import db from '../fixtures/db'

const dataType = {
  schema: {
    id: {
      type: 'text'
    }
  }
}

describe('Query#destroy', () => {
  const { user } = db.models
  it('should fail trying to destroy by invalid scope', async () => {
    const email = 'yo@yo.com'
    try {
      new Query({
        filters: [
          { email }
        ]
      }, { model: user.scope('public') })
    } catch (err) {
      return
    }
    throw new Error('Did not throw!')
  })
  it('should work with filters and update', async () => {
    const email = 'yo@yo.com'
    const query = new Query({
      filters: [
        { email }
      ]
    }, { model: user })
    query.update((v) => ({
      ...v,
      where: [
        ...v.where,
        { email: 'noexist@noexist.com' }
      ]
    }))
    const count = await query.destroy()
    should.exist(count)
    should(count).equal(0)
  })
  it('should destroy with filters', async () => {
    const email = 'yo@yo.com'
    const total = await user.count()
    const query = new Query({
      filters: [
        { email }
      ]
    }, { model: user })
    const count = await query.destroy()
    should.exist(count)
    should(count).equal(1)
    const whatsLeft = await user.findAll()
    should(total - whatsLeft.length).equal(1)
    should.not.exist(whatsLeft.find((i) => i.email === email))
  })
  it('should destroy with json filters', async () => {
    const query = new Query({
      filters: [
        { 'settings.id': 'abc' }
      ]
    }, { model: user, subSchemas: { settings: dataType.schema } })
    await query.destroy()
  })
})
