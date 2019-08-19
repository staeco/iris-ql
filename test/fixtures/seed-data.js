import db from './db'

const data = [
  {
    data: {
      id: 'SRC-123',
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
    data: {
      id: 'SRC-223',
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
  }
]

export default async () =>
  Promise.all(data.map(async (i) =>
    db.models.datum.create(i)
  ))
