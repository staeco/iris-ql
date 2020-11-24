import db from './db'

const data = [
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
        coordinates: [ 1, 2 ]
      }
    },
    geometry: {
      type: 'Point',
      coordinates: [ 1, 2 ]
    }
  },
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
].map((v) => db.models.datum.build(v).toJSON()) // generate the IDs

export default async () =>
  Promise.all(data.map(async (i) =>
    db.models.datum.upsert(i)
  ))
