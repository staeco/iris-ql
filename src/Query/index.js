import parse from './parse'

export default class Query {
  constructor(obj, table, options={}) {
    if (!obj) throw new Error('Missing query!')
    if (!table) throw new Error('Missing table!')
    this.input = obj
    this.table = table
    this.options = options
    this.parsed = parse(obj, {
      table,
      ...options
    })
  }
  update = (fn) => {
    const newValue = fn(this.parsed)
    if (!newValue || typeof newValue !== 'object') throw new Error('Invalid update function! Must return an object.')
    this.parsed = newValue
    return this
  }
  value = () => this.parsed
  execute = async ({ count=true }={}) => {
    /*
    if (this.hasAnalytics()) {
      const rows = await query.Model.findAll({
        raw: true,
        ...this.parsed
      })
      return rows
    }
    */
    const fn = count ? 'findAndCountAll' : 'findAll'
    return this.table[fn]({
      raw: true,
      ...this.parsed
    })
  }
  executeStream = async () => {
    // TODO
  }
}
