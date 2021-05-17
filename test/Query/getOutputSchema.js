import should from 'should'
import { Query } from '../../src'
import db from '../fixtures/db'
import dataType from '../fixtures/911-call'

describe('Query#getOutputSchema', () => {
  const { datum } = db.models
  it('should get a basic schema', async () => {
    const query = new Query(
      {
        filters: { sourceId: '911-calls' },
        limit: 1
      },
      {
        model: datum
      }
    )
    const res = query.getOutputSchema()
    should.exist(res)
    should(res).eql({
      id: {
        type: 'text',
        name: 'ID',
        notes: 'Unique ID'
      },
      createdAt: {
        type: 'date',
        name: 'Created',
        notes: 'Date and time this data was created'
      },
      updatedAt: {
        type: 'date',
        name: 'Last Modified',
        notes: 'Date and time this data was last updated'
      },
      sourceId: {
        type: 'text',
        name: 'Source ID'
      },
      data: {
        type: 'object',
        name: 'Data',
        notes: 'Properties of the datum'
      },
      geometry: {
        type: 'geometry',
        name: 'Geometry',
        notes: 'Geometry of the datum'
      }
    })
  })
  it('should work with subSchemas', async () => {
    const query = new Query(
      {
        filters: { sourceId: '911-calls' },
        limit: 1
      },
      {
        model: datum,
        subSchemas: { data: dataType.schema }
      }
    )
    const res = query.getOutputSchema()
    should.exist(res)
    should(res).eql({
      id: {
        type: 'text',
        name: 'ID',
        notes: 'Unique ID'
      },
      createdAt: {
        type: 'date',
        name: 'Created',
        notes: 'Date and time this data was created'
      },
      updatedAt: {
        type: 'date',
        name: 'Last Modified',
        notes: 'Date and time this data was last updated'
      },
      sourceId: {
        type: 'text',
        name: 'Source ID'
      },
      data: {
        type: 'object',
        schema: dataType.schema,
        name: 'Data',
        notes: 'Properties of the datum'
      },
      geometry: {
        type: 'geometry',
        name: 'Geometry',
        notes: 'Geometry of the datum'
      }
    })
  })
  it('should work with scopes', async () => {
    const query = new Query(
      {
        filters: { sourceId: '911-calls' },
        limit: 1
      },
      {
        model: datum.scope('public')
      }
    )
    const res = query.getOutputSchema()
    should.exist(res)
    should(res).eql({
      id: {
        type: 'text',
        name: 'ID',
        notes: 'Unique ID'
      },
      createdAt: {
        type: 'date',
        name: 'Created',
        notes: 'Date and time this data was created'
      },
      sourceId: {
        type: 'text',
        name: 'Source ID'
      },
      data: {
        type: 'object',
        name: 'Data',
        notes: 'Properties of the datum'
      },
      geometry: {
        type: 'geometry',
        name: 'Geometry',
        notes: 'Geometry of the datum'
      }
    })
  })
  it('should work with exclusions and scopes', async () => {
    const query = new Query(
      {
        filters: { sourceId: '911-calls' },
        limit: 1,
        exclusions: ['id', 'createdAt', 'sourceId']
      },
      {
        model: datum.scope('public')
      }
    )
    const res = query.getOutputSchema()
    should.exist(res)
    should(res).eql({
      data: {
        type: 'object',
        name: 'Data',
        notes: 'Properties of the datum'
      },
      geometry: {
        type: 'geometry',
        name: 'Geometry',
        notes: 'Geometry of the datum'
      }
    })
  })
})
