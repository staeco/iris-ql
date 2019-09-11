export const crimeTimeSeries = {
  filters: {
    sourceId: '911-calls',
    data: {
      receivedAt: { $ne: null }
    }
  },
  aggregations: [
    { value: { function: 'count' }, alias: 'total' },
    {
      alias: 'day',
      value: {
        function: 'bucket',
        arguments: [
          'day',
          { field: 'data.receivedAt' }
        ]
      }
    }
  ],
  orderings: [
    { value: { field: 'day' }, direction: 'desc' }
  ],
  groupings: [
    { field: 'day' }
  ]
}

const seventies = new Date(0).toISOString()
export const crimePerOfficer = {
  sourceId: '911-calls',
  visibility: 'public',
  filters: {
    data: {
      officers: { $ne: null }
    }
  },
  aggregations: [
    {
      value: { function: 'count' },
      filters: {
        data: {
          receivedAt: {
            $lt: seventies
          }
        }
      },
      alias: 'pre70s'
    },
    {
      value: { function: 'count' },
      filters: {
        data: {
          receivedAt: {
            $gte: seventies
          }
        }
      },
      alias: 'weekly'
    },
    {
      value: { function: 'count' },
      alias: 'total'
    },
    {
      alias: 'officer',
      value: {
        function: 'expand',
        arguments: [
          { field: 'data.officers' }
        ]
      }
    }
  ],
  orderings: [
    { value: { field: 'total' }, direction: 'desc' },
    { value: { field: 'officer' }, direction: 'asc' }
  ],
  groupings: [
    { field: 'officer' }
  ]
}
