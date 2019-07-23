import parse from './parse'

export default class Aggregation {
  constructor(obj, table, options={}) {
    if (!obj) throw new Error('Missing value!')
    this.input = obj
    this.table = table
    this.options = options
    this.parsed = parse(obj, {
      table,
      ...options
    })
  }
  value = () => this.parsed
  toJSON = () => this.input
}
