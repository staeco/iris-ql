import db from './db'

const calls = [
  {
    sourceId: '911-calls',
    data: {
      id: 'SRC-1',
      receivedAt: '2017-05-17T00:23:49.649Z',
      dispatchedAt: '2017-05-17T00:23:59.649Z',
      arrivedAt: '2017-05-17T00:24:09.649Z',
      units: [ 'W201', 'B691' ],
      officers: [ 'Wyatt', 'Smith' ],
      code: 'R-1',
      type: 'violent',
      description: 'Assault, Victim On Scene',
      location: {
        type: 'Point',
        coordinates: [ 1, 2 ]
      }
    },
    geometry: {
      type: 'Point',
      coordinates: [ 1, 2 ]
    }
  },
  {
    sourceId: '911-calls',
    data: {
      id: 'SRC-2',
      receivedAt: '2017-05-15T20:37:19.649Z',
      dispatchedAt: '2017-05-15T20:37:29.649Z',
      arrivedAt: '2017-05-15T20:37:39.649Z',
      units: [ 'B691', 'W999' ],
      officers: [ 'Smith', 'Johns' ],
      code: 'R-2',
      type: 'violent',
      description: 'Assault, Victim Fled',
      location: {
        type: 'Point',
        coordinates: [ 2, 2 ]
      }
    },
    geometry: {
      type: 'Point',
      coordinates: [ 2, 2 ]
    }
  }
]

const bikeTrips = [
  {
    sourceId: 'bike-trips',
    data: {
      id: 'SRC-1',
      startedAt: '2017-05-17T00:23:49.649Z',
      endedAt: '2017-05-17T00:24:09.649Z',
      issues: [ 'flat tire' ],
      type: 'regular',
      cost: 50.14,
      tax: 10.29,
      path: {
        type: 'LineString',
        coordinates: [
          [ 1, 2 ],
          [ 1, 8 ],
          [ 1, 12 ]
        ]
      }
    },
    geometry: {
      type: 'LineString',
      coordinates: [
        [ 1, 2 ],
        [ 1, 8 ],
        [ 1, 12 ]
      ]
    }
  },
  {
    sourceId: 'bike-trips',
    data: {
      id: 'SRC-2',
      startedAt: '2017-05-15T20:37:19.649Z',
      endedAt: '2017-05-15T20:37:39.649Z',
      type: 'electric',
      cost: 5.14,
      tax: 1.59,
      path: {
        type: 'LineString',
        coordinates: [
          [ 1, 2 ],
          [ 1, 8 ],
          [ 1, 12 ]
        ]
      }
    },
    geometry: {
      type: 'LineString',
      coordinates: [
        [ 1, 2 ],
        [ 1, 8 ],
        [ 1, 12 ]
      ]
    }
  }
]

const transitPassengers = [
  {
    sourceId: 'transit-passengers',
    data: {
      id: 'SRC-1-A',
      route: 'A',
      year: 2018,
      passengers: 2564
    }
  },
  {
    sourceId: 'transit-passengers',
    data: {
      id: 'SRC-1-B',
      route: 'B',
      year: 2018,
      passengers: 6566
    }
  },
  {
    sourceId: 'transit-passengers',
    data: {
      id: 'SRC-2-A',
      route: 'A',
      year: 2019,
      passengers: 3218
    }
  },
  {
    sourceId: 'transit-passengers',
    data: {
      id: 'SRC-2-B',
      route: 'B',
      year: 2019,
      passengers: 7622
    }
  },
  {
    sourceId: 'transit-passengers',
    data: {
      id: 'SRC-3-A',
      route: 'A',
      year: 2019,
      passengers: 10
    }
  },
  {
    sourceId: 'transit-passengers',
    data: {
      id: 'SRC-3-B',
      route: 'B',
      year: 2019,
      passengers: 10
    }
  }
]

const transitTrips = [
  {
    sourceId: 'transit-trips',
    data: {
      id: 'SRC-1-A',
      route: 'A',
      year: 2018,
      miles: 72364
    }
  },
  {
    sourceId: 'transit-trips',
    data: {
      id: 'SRC-1-B',
      route: 'B',
      year: 2018,
      miles: 89322
    }
  },
  {
    sourceId: 'transit-trips',
    data: {
      id: 'SRC-2-A',
      route: 'A',
      year: 2019,
      miles: 703202
    }
  },
  {
    sourceId: 'transit-trips',
    data: {
      id: 'SRC-2-B',
      route: 'B',
      year: 2019,
      miles: 85102
    }
  },
  {
    sourceId: 'transit-trips',
    data: {
      id: 'SRC-3-A',
      route: 'A',
      year: 2019,
      miles: 100
    }
  },
  {
    sourceId: 'transit-trips',
    data: {
      id: 'SRC-3-B',
      route: 'B',
      year: 2019,
      miles: 100
    }
  }
]

const data = [
  ...calls,
  ...bikeTrips,
  ...transitPassengers,
  ...transitTrips
].map((v) => db.models.datum.build(v).toJSON()) // generate the IDs

export default async () =>
  Promise.all(data.map(async (i) =>
    db.models.datum.upsert(i)
  ))
