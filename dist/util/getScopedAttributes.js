"use strict";

exports.__esModule = true;
exports.default = void 0;

var _default = ({
  rawAttributes,
  _scope
}) => {
  if (!_scope) return rawAttributes; // no scope

  const {
    attributes
  } = _scope;
  if (!attributes) return rawAttributes; // scope does not apply to attrs

  function _ref(prev, [k, v]) {
    if (!attributes.includes(k)) return prev;
    prev[k] = v;
    return prev;
  }

  if (Array.isArray(attributes)) {
    return Object.entries(rawAttributes).reduce(_ref, {});
  }

  function _ref2(prev, [k, v]) {
    if (attributes.exclude && attributes.exclude.includes(k)) return prev;
    if (attributes.include && !attributes.include.includes(k)) return prev;
    prev[k] = v;
    return prev;
  }

  if (Array.isArray(attributes.exclude) || Array.isArray(attributes.include)) {
    return Object.entries(rawAttributes).reduce(_ref2, {});
  }

  throw new Error('Scope too complex - could not determine safe values!');
};

exports.default = _default;
module.exports = exports.default;