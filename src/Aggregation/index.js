import parse from './parse'

export default class Aggregation {
  constructor(obj, options={}) {
    if (!obj) throw new Error('Missing value!')
    if (!options.table) throw new Error('Missing table!')
    this.input = obj
    this.options = options
    this._parsed = parse(obj, options)
  }
  value = () => this._parsed
  toJSON = () => this.input
}
