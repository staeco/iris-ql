import { pickBy } from 'lodash'
import parse from './parse'
import exportStream from '../util/export'
import getTypes from '../types/getTypes'

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
      const types = getTypes(agg.value, {
        ...this.options,
        context: [ 'aggregations', idx ]
      })
      if (types.length === 0) return prev // no types? weird
      const primaryType = types[0]
      const nv = {
        type: primaryType.type,
        name: agg.name,
        notes: agg.notes,
        measurement: primaryType.measurement
      }
      prev[agg.alias] = pickBy(nv)
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
