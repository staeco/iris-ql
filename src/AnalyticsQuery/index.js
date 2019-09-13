import parse from './parse'
import exportStream from '../util/export'
import getAggregationMeta from '../Aggregation/getMeta'

export default class AnalyticsQuery {
  constructor(obj, options={}) {
    if (!obj) throw new Error('Missing value!')
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

  execute = async () =>
    this.options.model.findAll({
      raw: true,
      ...this.value()
    })

  executeStream = async ({ format, transform }={}) =>
    exportStream({
      analytics: true,
      format,
      transform,
      model: this.options.model,
      value: this.value()
    })
}
