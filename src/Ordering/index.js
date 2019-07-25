import parse from './parse'

export default class Filter {
  constructor(obj, options={}) {
    if (!obj) throw new Error('Missing value!')
    if (!options.table) throw new Error('Missing table!')
    this.input = obj
    this.options = options
    this.parsed = parse(obj, options)
  }
  value = () => this.parsed
  toJSON = () => this.input
}
