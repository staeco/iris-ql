import db from './db'

const data = [
  {
    sourceId: '911-calls',
    data: {
      id: 'SRC-1',
      receivedAt: new Date(1494980629649).toISOString(),
      dispatchedAt: new Date(1494980639649).toISOString(),
      arrivedAt: new Date(1494980649649).toISOString(),
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
      receivedAt: new Date(1494880639649).toISOString(),
      dispatchedAt: new Date(1494880649649).toISOString(),
      arrivedAt: new Date(1494880659649).toISOString(),
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
      startedAt: new Date(1494980629649).toISOString(),
      endedAt: new Date(1494980649649).toISOString(),
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
      startedAt: new Date(1494880639649).toISOString(),
      endedAt: new Date(1494880659649).toISOString(),
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
