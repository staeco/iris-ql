import isObject from 'is-pure-object'

export default (v) => isObject(v) && (v.function || v.field)
