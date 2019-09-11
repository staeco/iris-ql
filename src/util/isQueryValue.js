import isObject from 'is-plain-object'

export default (v) => isObject(v) && (v.function || v.field)
