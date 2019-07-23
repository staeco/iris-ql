import seed from '../sql'

export default class Connection {
  constructor(db, options={}) {
    if (!db) throw new Error('Missing db option!')
    this.db = db
    this.options = options
  }
  tables = () => this.db.models
  seed = async () => seed(this.db)
}
