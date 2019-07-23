"use strict";

exports.__esModule = true;
exports.default = void 0;

// TODO: convert to use plain sequelize info, not custom table info
var _default = tableSchema => {
  const ret = Object.keys(tableSchema).filter(k => tableSchema[k].geospatial);
  return ret.length !== 0 ? ret : null;
};

exports.default = _default;
module.exports = exports.default;