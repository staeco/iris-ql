import getScopedAttributes from '../util/getScopedAttributes'

export default (model) =>
  Object.keys(getScopedAttributes(model)).map((f) => ({ type: 'column', field: f }))
