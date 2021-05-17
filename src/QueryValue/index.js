import parse from './parse'

export default class QueryValue {
  constructor(obj, options = {}) {
    if (!obj) throw new Error('Missing value!')
    if (!options.model || !options.model.rawAttributes)
      throw new Error('Missing model!')
    this.input = obj
    this.options = options
    this._parsed = parse(obj, options)
  }
  value = () => this._parsed
  toJSON = () => this.input
}
