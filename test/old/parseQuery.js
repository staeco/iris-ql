import parseQuery from 'lib/query/parseQuery'
import { dataType, boundary } from 'tables'
import should from 'should'

describe('lib#query#parseQuery', () => {
  it('should exist', () => {
    should(parseQuery).not.be.null()
    should(typeof parseQuery).equal('function')
  })
  it('should parse search query', () => {
    //should(
    const res = parseQuery({
      search: 'issue'
    }, {
      table: dataType
    })
    should(res).deepEqual({
      where: [
        {
          $or: [
            {
              id: {
                $iLike: '%issue%'
              }
            },
            {
              category: {
                $iLike: '%issue%'
              }
            },
            {
              name: {
                $iLike: '%issue%'
              }
            },
            {
              notes: {
                $iLike: '%issue%'
              }
            }
          ]
        }
      ],
      order: []
    })
  })
  it('should throw on invalid search query', () => {
    should.throws(() => parseQuery({
      search: {
        where: {}
      }
    }, {
      table: dataType
    }))
  })
  it('should parse after timestamp query', () => {
    should(parseQuery({
      after: '2019-07-23T22:19:08.148Z'
    }, {
      table: dataType
    }))
      .deepEqual({
        where: [
          {
            $or: [
              { createdAt: { $gt: new Date('2019-07-23T22:19:08.148Z') } },
              { updatedAt: { $gt: new Date('2019-07-23T22:19:08.148Z') } }
            ]
          }
        ],
        order: []
      })
  })
  it('should throw error on invalid date for after', () => {
    should.throws(() => parseQuery({
      after: 'non-date-string'
    }, {
      table: dataType
    }))
  })
  it('should parse before timestamp query', () => {
    should(parseQuery({
      before: '2019-07-23T22:19:08.148Z'
    }, {
      table: dataType
    }))
      .deepEqual({
        where: [
          {
            $or: [
              { createdAt: { $lt: new Date('2019-07-23T22:19:08.148Z') } },
              { updatedAt: { $lt: new Date('2019-07-23T22:19:08.148Z') } }
            ]
          }
        ],
        order: []
      })
  })
  it('should throw error on invalid date for before', () => {
    should.throws(() => parseQuery({
      before: 'non-date-string'
    }, {
      table: dataType
    }))
  })
  it('should parse filters by passing through', () => {
    const res = parseQuery({
      filters: {
        id: {
          eq: 'issue'
        }
      }
    },{
      table: dataType
    })
    should(res).deepEqual({
      where: [
        {
          id: {
            eq: 'issue'
          }
        }
      ],
      order: []
    })
  })
  it('should throw error on invalid filters', () => {
    should.throws(() => parseQuery({
      filters: {
        invalidKey: {} //this should cause an error because there is no such column in dataType table
      }
    },{
      table: dataType
    }))
  })
  it('should parse within query', () => {
    const res = JSON.parse(JSON.stringify(parseQuery({ //use JSON to ignore prototypes for comparison
      within: {
        xmin: '-92.704076',
        xmax: '-92.686376',
        ymin: '35.029341',
        ymax: '35.038563'
      }
    }, {
      table: boundary
    })))
    should(res).eql({
      where: [
        {
          fn: 'ST_Intersects',
          args: [
            { col: 'boundary.area' },
            {
              fn: 'ST_MakeEnvelope',
              args: [
                -92.704076,
                35.029341,
                -92.686376,
                35.038563
              ]
            }
          ]
        }
      ],
      order: []
    })
  })
  it('should query for a point', () => {
    const res = JSON.parse(JSON.stringify(parseQuery({
      intersects: {
        x: '-92.686376',
        y: '35.029341'
      }
    },{
      table: boundary
    })))
    should(res).deepEqual({
      where: [
        {
          fn: 'ST_Intersects',
          args: [
            {
              col: 'boundary.area'
            },
            {
              fn: 'ST_Point',
              args: [
                -92.686376,
                35.029341
              ]
            }
          ]
        }
      ],
      order: []
    })
  })
  it('should parse orderings query', () => {
    const res = JSON.parse(JSON.stringify(parseQuery({
      orderings: [
        {
          value: { field: 'id' },
          direction: 'desc'
        }
      ]
    },{
      table: dataType
    })))
    should(res).eql({
      where: [],
      order: [
        [
          { col: 'id' },
          'desc'
        ]
      ]
    })
  })
  it('should parse exclusions query', () => {
    const res = JSON.parse(JSON.stringify(parseQuery({
      exclusions: [
        'createdAt',
        'updatedAt'
      ]
    }, {
      table: boundary
    })))
    should(res).eql({
      where: [],
      order: [],
      attributes: {
        exclude: [
          'createdAt',
          'updatedAt'
        ]
      }
    })
  })
  it('should parse limit in query', () => {
    const res = JSON.parse(JSON.stringify(parseQuery({
      limit: '3'
    },{
      table: boundary
    })))
    should(res).eql({
      where: [],
      order: [],
      limit: 3
    })
  })
  it('should parse offset in query', () => {
    const res = JSON.parse(JSON.stringify(parseQuery({
      offset: '314'
    },{
      table: boundary
    })))
    should(res).eql({
      where: [],
      order: [],
      offset: 314
    })
  })
})
