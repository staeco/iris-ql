import parse from './parse'

export default class Ordering {
  constructor(obj, options={}) {
    if (!obj) throw new Error('Missing value!')
    if (!options.table || !options.table.rawAttributes) throw new Error('Missing table!')
    this.input = obj
    this.options = options
    this._parsed = parse(obj, options)
  }
  value = () => this._parsed
  toJSON = () => this.input
}
