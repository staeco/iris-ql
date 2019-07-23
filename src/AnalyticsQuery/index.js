import parse from './parse'

export default class Query {
  constructor(obj, table, options={}) {
    if (!obj) throw new Error('Missing query!')
    if (!table) throw new Error('Missing table!')
    this.input = obj
    this.table = table
    this.options = options
    this.parsed = parse(obj, {
      table,
      ...options
    })
    if (!this.parsed.group || this.parsed.group.length === 0) throw new Error('Missing groupings!')
  }
  update = (fn) => {
    const newValue = fn(this.parsed)
    if (!newValue || typeof newValue !== 'object') throw new Error('Invalid update function! Must return an object.')
    this.parsed = newValue
    return this
  }
  value = () => this.parsed
  toJSON = () => this.input
  execute = async () =>
    this.table.findAll({
      raw: true,
      ...this.parsed
    })
  executeStream = async () => {
    // TODO
  }
}
