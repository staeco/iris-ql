import parse from './parse'
import exportStream from '../util/export'

export default class Query {
  constructor(obj, options={}) {
    if (!obj) throw new Error('Missing query!')
    if (!options.model || !options.model.rawAttributes) throw new Error('Missing model!')
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
  execute = async ({ count=true, raw=false }={}) => {
    const fn = count ? 'findAndCountAll' : 'findAll'
    return this.options.model[fn]({
      raw,
      logging: this.options.debug,
      ...this.value()
    })
  }
  executeStream = async ({ format, transform }={}) =>
    exportStream({
      format,
      transform,
      debug: this.options.debug,
      model: this.options.model,
      value: this.value()
    })

  destroy = async () => {
    // need to reparse it with instanceQuery false, the sequelize query builder does not alias destroys for filters
    const baseQuery = parse(this.input, {
      ...this.options,
      instanceQuery: false
    })
    return this.options.model.destroy({
      logging: this.options.debug,
      ...baseQuery
    })
  }
}
