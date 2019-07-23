import db from './db'

const data = [
  {
    email: 'yo@yo.com',
    name: 'Yo Yo',
    authId: 'yaba',
    authToken: 'yoyo'
  },
  {
    email: 'yo2@yo.com',
    name: 'Yo Yo',
    authId: 'yaba2',
    authToken: 'yoyo'
  },
  {
    email: 'yo3@yo.com',
    name: 'Yo Yo',
    authId: 'yaba3',
    authToken: 'yoyo'
  }
]

export default async () =>
  Promise.all(data.map(async (i) =>
    db.models.user.create(i)
  ))
