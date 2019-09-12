import isObject from 'is-plain-obj'

export default (v) => isObject(v) && (v.function || v.field)
