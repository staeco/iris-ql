import isObject from 'is-plain-obj'
import parse from './parse'
import exportStream from '../util/export'
import getTypes from '../types/getTypes'
import getModelFieldLimit from '../util/getModelFieldLimit'
import runWithTimeout from '../util/runWithTimeout'

export default class Query {
  constructor(obj, options = {}) {
    if (!obj) throw new Error('Missing query!')
    if (!options.model || !options.model.rawAttributes) throw new Error('Missing model!')
    if (options.fieldLimit && !Array.isArray(options.fieldLimit)) throw new Error('Invalid fieldLimit!')
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
  constrain = ({ defaultLimit, maxLimit, attributes, where } = {}) => {
    if (where && !Array.isArray(where)) throw new Error('Invalid where array!')
    if (attributes && !Array.isArray(attributes)) throw new Error('Invalid attributes array!')
    return this.update((v) => {
      const limit = v.limit || defaultLimit
      return {
        ...v,
        attributes: attributes || v.attributes,
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

  execute = async ({ raw = false, useMaster, debug, timeout } = {}) => {
    const fn = this.options.count !== false ? 'findAndCountAll' : 'findAll'
    const exec = (transaction) =>
      this.options.model[fn]({
        raw,
        useMaster,
        logging: debug,
        transaction,
        ...this.value()
      })

    if (!timeout) return exec()
    return runWithTimeout(exec, {
      sequelize: this.options.model.sequelize,
      timeout
    })
  }
  executeStream = async ({ onError, format, tupleFraction, transform, useMaster, debug, timeout, finishTimeout } = {}) =>
    exportStream({
      timeout,
      finishTimeout,
      useMaster,
      tupleFraction,
      format,
      transform,
      onError,
      debug,
      model: this.options.model,
      value: this.value()
    })

  count = async ({ useMaster, timeout, debug } = {}) => {
    const exec = (transaction) =>
      this.options.model.count({
        useMaster,
        transaction,
        logging: debug,
        ...this.value()
      })
    if (!timeout) return exec()
    return runWithTimeout(exec, {
      sequelize: this.options.model.sequelize,
      timeout
    })
  }

  destroy = async ({ debug, timeout } = {}) => {
    const exec = (transaction) =>
      this.options.model.destroy({
        logging: debug,
        transaction,
        ...this.value({ instanceQuery: false })
      })
    if (!timeout) return exec()
    return runWithTimeout(exec, {
      sequelize: this.options.model.sequelize,
      timeout
    })
  }
}
