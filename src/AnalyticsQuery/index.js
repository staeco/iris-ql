import parse from './parse'
import exportStream from '../util/export'


export default class AnalyticsQuery {
  constructor(obj, options={}) {
    if (!obj) throw new Error('Missing value!')
    if (!options.table) throw new Error('Missing table!')
    this.input = obj
    this.options = options
    this._parsed = parse(obj, options)
  }
  update = (fn) => {
    if (typeof fn !== 'function') throw new Error('Missing update function!')
    const newValue = fn(this._parsed)
    if (!newValue || typeof newValue !== 'object') throw new Error('Invalid update function! Must return an object.')
    this._parsed = newValue
    return this
  }
  value = () => this._parsed
  toJSON = () => this.input
  execute = async () =>
    this.options.table.findAll({
      raw: true,
      ...this.value()
    })

  executeStream = async ({ format, transform }={}) =>
    exportStream({
      analytics: true,
      format,
      transform,
      table: this.options.table,
      value: this.value()
    })
}
