import db from './db'

const data = [
  {
    name: 'Nike',
    type: 'shoes',
    location: {
      type: 'Point',
      coordinates: [
        5, 5
      ]
    }
  },
  {
    name: 'Petco',
    type: 'animals',
    location: {
      type: 'Point',
      coordinates: [
        10, 10
      ]
    }
  },
  {
    name: 'Goodwill',
    type: 'thrift',
    location: {
      type: 'Point',
      coordinates: [
        20, 20
      ]
    }
  }
]

export default async () =>
  Promise.all(data.map(async (i) =>
    db.models.store.create(i)
  ))
