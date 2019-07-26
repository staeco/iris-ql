import parse from './parse'

export default class AnalyticsQuery {
  constructor(obj, options={}) {
    if (!obj) throw new Error('Missing value!')
    if (!options.table) throw new Error('Missing table!')
    this.input = obj
    this.options = options
    this.parsed = parse(obj, options)
    if (!this.parsed.group || this.parsed.group.length === 0) throw new Error('Missing groupings!')
  }
  update = (fn) => {
    if (typeof fn !== 'function') throw new Error('Missing update function!')
    const newValue = fn(this.parsed)
    if (!newValue || typeof newValue !== 'object') throw new Error('Invalid update function! Must return an object.')
    this.parsed = newValue
    return this
  }
  value = () => this.parsed
  toJSON = () => this.input
  execute = async () =>
    this.options.table.findAll({
      raw: true,
      ...this.parsed
    })
  executeStream = async () => {
    // TODO
  }
}
