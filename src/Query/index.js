import isObject from 'is-plain-obj'
import parse from './parse'
import exportStream from '../util/export'
import getTypes from '../types/getTypes'
import getModelFieldLimit from '../util/getModelFieldLimit'

export default class Query {
  constructor(obj, options = {}) {
    if (!obj) throw new Error('Missing query!')
    if (!options.model || !options.model.rawAttributes) throw new Error('Missing model!')
    this.input = obj
    this.options = options
    this._parsed = parse(obj, options)
    this._parsedCollection = parse(obj, { ...options, instanceQuery: false })
  }
  update = (fn) => {
    if (isObject(fn)) return this.update((v) => ({ ...v, ...fn }))
    if (typeof fn !== 'function') throw new Error('Missing update function!')

    // update instance query
    const newInstanceValue = fn(this._parsed)
    if (!newInstanceValue || typeof newInstanceValue !== 'object') throw new Error('Invalid update function! Must return an object.')
    this._parsed = newInstanceValue

    // update non-instance query
    const newCollectionValue = fn(this._parsedCollection)
    if (!newCollectionValue || typeof newCollectionValue !== 'object') throw new Error('Invalid update function! Must return an object.')
    this._parsedCollection = newCollectionValue
    return this
  }
  constrain = ({ defaultLimit, maxLimit, where } = {}) => {
    if (where && !Array.isArray(where)) throw new Error('Invalid where array!')
    this.update((v) => {
      const limit = v.limit || defaultLimit
      return {
        ...v,
        where: where
          ? [ ...v.where, ...where ]
          : v.where,
        limit: maxLimit
          ? limit
            ? Math.min(limit, maxLimit)
            : maxLimit
          : limit
      }
    })
    return this
  }
  value = ({ instanceQuery = true } = {}) => instanceQuery ? this._parsed : this._parsedCollection
  toJSON = () => this.input
  getOutputSchema = () => {
    let fieldLimit = this.options.fieldLimit || getModelFieldLimit(this.options.model)
    if (this.input.exclusions) {
      fieldLimit = fieldLimit.filter((i) => !this.input.exclusions.includes(i.field))
    }
    return fieldLimit.reduce((acc, f) => {
      acc[f.field] = getTypes({ field: f.field }, this.options)[0]
      return acc
    }, {})
  }

  execute = async ({ raw = false, useMaster } = {}) => {
    const fn = this.options.count !== false ? 'findAndCountAll' : 'findAll'
    return this.options.model[fn]({
      raw,
      useMaster,
      logging: this.options.debug,
      ...this.value()
    })
  }
  executeStream = async ({ onError, format, tupleFraction, transform, useMaster } = {}) =>
    exportStream({
      useMaster,
      tupleFraction,
      format,
      transform,
      onError,
      debug: this.options.debug,
      model: this.options.model,
      value: this.value()
    })

  count = async ({ useMaster } = {}) =>
    this.options.model.count({
      useMaster,
      logging: this.options.debug,
      ...this.value()
    })

  destroy = async () =>
    this.options.model.destroy({
      logging: this.options.debug,
      ...this.value({ instanceQuery: false })
    })
}
