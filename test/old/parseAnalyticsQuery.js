import parseAnalyticsQuery from 'lib/query/parseAnalyticsQuery'
import { dataType, datum } from 'tables'
import should from 'should'

const c = (k) => JSON.parse(JSON.stringify(k)) // clean object to remove prototype info for comparison

describe('lib#query#parseAnalyticsQuery', () => {
  it('should exist', () => {
    should(parseAnalyticsQuery).not.be.null()
  })
  it('should parse analytics query for issue', async () => {
    const issueType = dataType.Model.findById('issue')
    const res = c(parseAnalyticsQuery({
      key: '875b9380-66e9-46e7-80b0-e310962c16d9',
      aggregations: [
        {
          name: 'Total #',
          type: 'number',
          alias: 'total',
          value: { function: 'count' }
        },
        {
          alias: 'minute',
          value: {
            function: 'truncate',
            arguments: [
              'minute',
              { field: 'createdAt' }
            ]
          }
        }
      ],
      orderings: [
        {
          value: { field: 'minute' },
          direction: 'desc'
        }
      ],
      groupings: [
        { field: 'minute' }
      ]
    },{
      table: datum,
      dataType: issueType
    }))
    should(res).eql({
      where: [],
      order: [
        [
          {
            col: 'minute'
          },
          'desc'
        ]
      ],
      group: [
        {
          col: 'minute'
        }
      ],
      attributes: [
        [
          {
            fn: 'count',
            args: [
              {
                val: '*'
              }
            ]
          },
          'total'
        ],
        [
          {
            fn: 'date_trunc',
            args: [
              'minute',
              {
                col: 'createdAt'
              }
            ]
          },
          'minute'
        ]
      ]
    })
  })
  it('should throw on invalid table', () =>
    should.throws(() => parseAnalyticsQuery({
      table: {}
    })))
})
