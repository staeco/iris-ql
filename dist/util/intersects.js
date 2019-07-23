"use strict";

exports.__esModule = true;
exports.default = void 0;

var _getGeoFields = _interopRequireDefault(require("./getGeoFields"));

var _sequelize = require("sequelize");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: convert to use plain sequelize info, not custom table
var _default = (geo, {
  table,
  column = table.name
}) => {
  const geoFields = (0, _getGeoFields.default)(table);
  if (!geo || !geoFields) return (0, _sequelize.literal)(false);
  const wheres = geoFields.map(f => (0, _sequelize.fn)('ST_Intersects', (0, _sequelize.col)(`${column}.${f}`), geo));
  if (wheres.length === 1) return wheres[0];
  return (0, _sequelize.or)(...wheres);
};

exports.default = _default;
module.exports = exports.default;