"use strict";

exports.__esModule = true;
exports.text = exports.polygon = exports.point = exports.object = exports.number = exports.multipolygon = exports.multiline = exports.line = exports.date = exports.boolean = exports.array = void 0;
var _sequelize = _interopRequireDefault(require("sequelize"));
var _isNumber = _interopRequireDefault(require("is-number"));
var _humanSchema = require("human-schema");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const wgs84 = 4326;
const geoCast = txt => _sequelize.default.fn('ST_SetSRID', _sequelize.default.fn('ST_GeomFromGeoJSON', txt), wgs84);

// Extend human-schema types and:
// - add a hydrate function to go from db text values -> properly typed values
// - make some types more permissive, since queries are often passed in via querystring

const array = exports.array = {
  ..._humanSchema.types.array,
  // TODO: recursively map the array against the right types
  // this treats everything as a text array
  // probably need to pass in type and let the db figure out hydrating
  hydrate: txt => _sequelize.default.fn('fix_jsonb_array', txt)
};
const object = exports.object = {
  ..._humanSchema.types.object,
  hydrate: txt => _sequelize.default.cast(txt, 'jsonb')
};
const text = exports.text = {
  ..._humanSchema.types.text,
  hydrate: txt => txt
};
const number = exports.number = {
  ..._humanSchema.types.number,
  test: _isNumber.default,
  hydrate: txt => _sequelize.default.cast(txt, 'numeric')
};
const boolean = exports.boolean = {
  ..._humanSchema.types.boolean,
  hydrate: txt => _sequelize.default.cast(txt, 'boolean')
};
const date = exports.date = {
  ..._humanSchema.types.date,
  hydrate: txt => _sequelize.default.fn('parse_iso', txt)
};
const point = exports.point = {
  ..._humanSchema.types.point,
  hydrate: geoCast
};
const line = exports.line = {
  ..._humanSchema.types.line,
  hydrate: geoCast
};
const multiline = exports.multiline = {
  ..._humanSchema.types.multiline,
  hydrate: geoCast
};
const polygon = exports.polygon = {
  ..._humanSchema.types.polygon,
  hydrate: geoCast
};
const multipolygon = exports.multipolygon = {
  ..._humanSchema.types.multipolygon,
  hydrate: geoCast
};