import parse from './parse'
import exportStream from '../util/export'

export default class Query {
  constructor(obj, options={}) {
    if (!obj) throw new Error('Missing query!')
    if (!options.model || !options.model.rawAttributes) throw new Error('Missing model!')
    this.input = obj
    this.options = options
    this._parsed = parse(obj, options)
    this._parsedCollection = parse(obj, { ...options, instanceQuery: false })
  }
  update = (fn) => {
    if (typeof fn !== 'function') throw new Error('Missing update function!')

    // update instance query
    const newInstanceValue = fn(this._parsed)
    if (!newInstanceValue || typeof newInstanceValue !== 'object') throw new Error('Invalid update function! Must return an object.')
    this._parsed = newInstanceValue

    // update non-instance query
    const newCollectionValue = fn(this._parsed)
    if (!newCollectionValue || typeof newCollectionValue !== 'object') throw new Error('Invalid update function! Must return an object.')
    this._parsedCollection = newCollectionValue
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

  destroy = async () =>
    this.options.model.destroy({
      logging: this.options.debug,
      ...this._parsedCollection
    })
}
