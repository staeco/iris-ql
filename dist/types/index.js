"use strict";

exports.__esModule = true;
exports.multipolygon = exports.polygon = exports.multiline = exports.line = exports.point = exports.date = exports.boolean = exports.number = exports.text = exports.object = exports.array = exports.any = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _errors = require("../errors");

var _moment = _interopRequireDefault(require("moment"));

var _isNumber = _interopRequireDefault(require("is-number"));

var _isPureObject = _interopRequireDefault(require("is-pure-object"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const zones = new Set(_moment.default.tz.names());

const getBasicGeoJSONIssues = (v, type) => {
  if (!(0, _isPureObject.default)(v)) return 'Not a valid object';
  if (v.type !== type) return `Not a valid type value (Expected ${type} not ${v.type})`;
}; // test is used to validate and type user-inputted values
// hydrate is used to hydrate db text values to their properly typed values


const any = {
  name: 'Any',
  check: () => true,
  hydrate: txt => txt
};
exports.any = any;
const array = {
  name: 'List',
  items: true,
  check: v => Array.isArray(v),
  // TODO: recursively map the array against the right types
  // this treats everything as a text array
  // probably need to pass in type and let the db figure out hydrating
  hydrate: txt => _sequelize.default.fn('fix_jsonb_array', txt)
};
exports.array = array;
const object = {
  name: 'Map',
  check: _isPureObject.default,
  hydrate: txt => _sequelize.default.cast(txt, 'jsonb')
};
exports.object = object;
const text = {
  name: 'Text',
  check: v => typeof v === 'string',
  hydrate: txt => txt
};
exports.text = text;
const number = {
  name: 'Number',
  check: v => (0, _isNumber.default)(v),
  hydrate: txt => _sequelize.default.cast(txt, 'numeric')
};
exports.number = number;
const boolean = {
  name: 'True/False',
  check: v => typeof v === 'boolean',
  hydrate: txt => _sequelize.default.cast(txt, 'boolean')
};
exports.boolean = boolean;
const date = {
  name: 'Date/Time',
  check: v => (0, _moment.default)(v, _moment.default.ISO_8601).isValid(),
  hydrate: (txt, {
    timezone
  }) => {
    if (!timezone) return _sequelize.default.fn('parse_iso', txt);
    if (!zones.has(timezone)) throw new _errors.BadRequestError('Not a valid timezone');
    return _sequelize.default.fn('parse_iso', txt, timezone);
  }
}; // geo (EPSG:4979 / WGS84)

exports.date = date;

const geoCast = txt => _sequelize.default.fn('ST_GeomFromGeoJSON', txt);

const point = {
  name: 'GeoJSON Point',
  check: v => !getBasicGeoJSONIssues(v, 'Point'),
  hydrate: geoCast
};
exports.point = point;
const line = {
  name: 'GeoJSON LineString',
  check: v => !getBasicGeoJSONIssues(v, 'LineString'),
  hydrate: geoCast
};
exports.line = line;
const multiline = {
  name: 'GeoJSON MultiLineString',
  check: v => !getBasicGeoJSONIssues(v, 'MultiLineString'),
  hydrate: geoCast
};
exports.multiline = multiline;
const polygon = {
  name: 'GeoJSON Polygon',
  check: v => !getBasicGeoJSONIssues(v, 'Polygon'),
  hydrate: geoCast
};
exports.polygon = polygon;
const multipolygon = {
  name: 'GeoJSON MultiPolygon',
  check: v => !getBasicGeoJSONIssues(v, 'MultiPolygon'),
  hydrate: geoCast
};
exports.multipolygon = multipolygon;