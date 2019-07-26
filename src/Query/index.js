import parse from './parse'

export default class Query {
  constructor(obj, options={}) {
    if (!obj) throw new Error('Missing query!')
    if (!options.table) throw new Error('Missing table!')
    this.input = obj
    this.options = options
    this.parsed = parse(obj, options)
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
  execute = async ({ count=true }={}) => {
    const fn = count ? 'findAndCountAll' : 'findAll'
    return this.options.table[fn]({
      raw: true,
      ...this.parsed
    })
  }
  executeStream = async () => {
    // TODO
  }
}
