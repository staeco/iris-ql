export default class QueryValue {
  constructor(obj, schema, options={}) {
    if (!obj) throw new Error('Missing value!')
    this.input = obj
    this.schema = schema
    this.options = options
  }
}
