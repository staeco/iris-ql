"use strict";

exports.__esModule = true;
exports.default = void 0;
function _ref(s) {
  return String(s);
}
var _default = v => {
  if (v == null) return []; // nada
  if (Array.isArray(v)) return v.map(_ref);
  if (typeof v === 'string') return v.split(',');
  return [String(v)];
};
exports.default = _default;
module.exports = exports.default;