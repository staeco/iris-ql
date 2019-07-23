"use strict";

exports.__esModule = true;
exports.default = void 0;

var _default = v => {
  if (v == null) return []; // nada

  if (Array.isArray(v)) return v.map(s => String(s));
  if (typeof v === 'string') return v.split(',');
  return [String(v)];
};

exports.default = _default;
module.exports = exports.default;