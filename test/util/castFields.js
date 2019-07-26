import should from 'should'
import castFields from '../../src/util/castFields'
import { Connection } from '../../src'
import db from '../fixtures/db'

describe('util#castFields', () => {
  const conn = new Connection(db)
  const { user } = conn.tables()
  it('should reutrn uncasted fields', () => {
    const t = castFields({ id: '' }, {}, user)
    should(t).eql({ id: '' })
  })

  it('should reutrn casted fields', () => {
    const t = castFields({ id: '' }, { dataType: 'crime' }, user)
    should(t.val).equal('"user"."id" = \'\'')
  })

  it('should reutrn casted array fields', () => {
    const t = castFields([ { id: '' } ], { dataType: 'crime' }, user)
    should(t.val).equal('("user"."id" = \'\')')
  })
})
