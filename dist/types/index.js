"use strict";

exports.__esModule = true;
exports.multipolygon = exports.polygon = exports.multiline = exports.line = exports.point = exports.date = exports.boolean = exports.number = exports.text = exports.object = exports.array = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _isNumber = _interopRequireDefault(require("is-number"));

var _humanSchema = require("human-schema");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const wgs84 = 4326;

const geoCast = txt => _sequelize.default.fn('ST_SetSRID', _sequelize.default.fn('ST_GeomFromGeoJSON', txt), wgs84); // Extend human-schema types and:
// - add a hydrate function to go from db text values -> properly typed values
// - make some types more permissive, since queries are often passed in via querystring


const array = _objectSpread(_objectSpread({}, _humanSchema.types.array), {}, {
  // TODO: recursively map the array against the right types
  // this treats everything as a text array
  // probably need to pass in type and let the db figure out hydrating
  hydrate: txt => _sequelize.default.fn('fix_jsonb_array', txt)
});

exports.array = array;

const object = _objectSpread(_objectSpread({}, _humanSchema.types.object), {}, {
  hydrate: txt => _sequelize.default.cast(txt, 'jsonb')
});

exports.object = object;

const text = _objectSpread(_objectSpread({}, _humanSchema.types.text), {}, {
  hydrate: txt => txt
});

exports.text = text;

const number = _objectSpread(_objectSpread({}, _humanSchema.types.number), {}, {
  test: _isNumber.default,
  hydrate: txt => _sequelize.default.cast(txt, 'numeric')
});

exports.number = number;

const boolean = _objectSpread(_objectSpread({}, _humanSchema.types.boolean), {}, {
  hydrate: txt => _sequelize.default.cast(txt, 'boolean')
});

exports.boolean = boolean;

const date = _objectSpread(_objectSpread({}, _humanSchema.types.date), {}, {
  hydrate: txt => _sequelize.default.fn('parse_iso', txt)
});

exports.date = date;

const point = _objectSpread(_objectSpread({}, _humanSchema.types.point), {}, {
  hydrate: geoCast
});

exports.point = point;

const line = _objectSpread(_objectSpread({}, _humanSchema.types.line), {}, {
  hydrate: geoCast
});

exports.line = line;

const multiline = _objectSpread(_objectSpread({}, _humanSchema.types.multiline), {}, {
  hydrate: geoCast
});

exports.multiline = multiline;

const polygon = _objectSpread(_objectSpread({}, _humanSchema.types.polygon), {}, {
  hydrate: geoCast
});

exports.polygon = polygon;

const multipolygon = _objectSpread(_objectSpread({}, _humanSchema.types.multipolygon), {}, {
  hydrate: geoCast
});

exports.multipolygon = multipolygon;