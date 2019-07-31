"use strict";

exports.__esModule = true;
exports.default = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = model => {
  const attrs = model.rawAttributes;
  const ret = Object.keys(attrs).filter(k => {
    const {
      type
    } = attrs[k];
    return type instanceof _sequelize.default.GEOGRAPHY || type instanceof _sequelize.default.GEOMETRY;
  });
  return ret.length !== 0 ? ret : null;
};

exports.default = _default;
module.exports = exports.default;