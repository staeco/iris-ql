import db from './db'

const data = [
  {
    email: 'yo@yo.com',
    name: 'Yo Yo 1',
    authId: 'yaba',
    authToken: 'yoyo',
    settings: {
      vegan: true,
      glutenAllergy: false
    }
  },
  {
    email: 'yo2@yo.com',
    name: 'Yo Yo 2',
    authId: 'yaba2',
    authToken: 'yoyo',
    settings: {
      vegan: true,
      glutenAllergy: false
    }
  },
  {
    email: 'yo3@yo.com',
    name: 'Yo Yo 3',
    authId: 'yaba3',
    authToken: 'yoyo',
    settings: {
      vegan: true,
      glutenAllergy: false
    }
  }
].map((v) => db.models.user.build(v).toJSON()) // generate the IDs

export default async () =>
  Promise.all(data.map(async (i) =>
    db.models.user.upsert(i)
  ))
