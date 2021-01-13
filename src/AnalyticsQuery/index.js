import sql, { QueryTypes } from 'sequelize'
import isObject from 'is-plain-obj'
import parse from './parse'
import exportStream from '../util/export'
import { select } from '../util/toString'
import getAggregationMeta from '../Aggregation/getMeta'
import Query from '../Query'

export default class AnalyticsQuery {
  constructor(obj, options = {}) {
    if (!obj) throw new Error('Missing value!')
    if (!options.model || !options.model.rawAttributes) throw new Error('Missing model!')
    if (!obj.aggregations && !obj.groupings) return new Query(obj, { ...options, count: false }) // skip the advanced stuff and kick it down a level
    this.input = obj
    this.options = options
    this._parsed = parse(obj, options)
  }
  update = (fn) => {
    if (isObject(fn)) return this.update((v) => ({ ...v, ...fn }))
    if (typeof fn !== 'function') throw new Error('Missing update function!')
    const newValue = fn(this._parsed)
    if (!newValue || typeof newValue !== 'object') throw new Error('Invalid update function! Must return an object.')
    this._parsed = newValue
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
  value = () => this._parsed
  toJSON = () => this.input
  getOutputSchema = () =>
    this.input.aggregations.reduce((prev, agg, idx) => {
      const meta = getAggregationMeta(agg, {
        ...this.options,
        context: [ 'aggregations', idx ]
      })
      if (!meta) return prev // no types? weird
      prev[agg.alias] = meta
      return prev
    }, {})

  execute = async ({ useMaster, debug } = {}) =>
    this.options.model.sequelize.query(select({
      value: this.value(),
      model: this.options.model,
      analytics: true
    }), {
      useMaster,
      raw: true,
      type: QueryTypes.SELECT,
      logging: debug,
      model: this.options.model
    })

  executeStream = async ({ onError, format, tupleFraction, transform, useMaster, debug } = {}) =>
    exportStream({
      analytics: true,
      useMaster,
      tupleFraction,
      format,
      transform,
      onError,
      debug: debug,
      model: this.options.model,
      value: this.value()
    })
}
