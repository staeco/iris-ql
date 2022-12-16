"use strict";

exports.__esModule = true;
exports.default = void 0;
var _default = v => {
  if (v == null || !v) return;
  const d = new Date(v);
  if (isNaN(d)) throw new Error('Bad date value');
  return d;
};
exports.default = _default;
module.exports = exports.default;