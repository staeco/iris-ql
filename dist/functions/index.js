"use strict";

exports.__esModule = true;
exports.boundingBox = exports.geojson = exports.distance = exports.intersects = exports.length = exports.area = exports.extract = exports.truncate = exports.ms = exports.interval = exports.lastYear = exports.lastMonth = exports.lastWeek = exports.now = exports.remainder = exports.divide = exports.multiply = exports.subtract = exports.add = exports.eq = exports.lte = exports.gte = exports.lt = exports.gt = exports.count = exports.median = exports.average = exports.sum = exports.max = exports.min = exports.expand = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _isPureObject = _interopRequireDefault(require("is-pure-object"));

var _errors = require("../errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const numeric = v => _sequelize.default.cast(v, 'numeric');

const truncates = {
  millisecond: 'milliseconds',
  second: 'second',
  minute: 'minute',
  hour: 'hour',
  day: 'day',
  week: 'week',
  month: 'month',
  quarter: 'quarter',
  year: 'year',
  decade: 'decade'
};
const parts = {
  millisecond: 'milliseconds',
  second: 'second',
  minute: 'minute',
  hour: 'hour',
  dayOfWeek: 'dow',
  dayOfMonth: 'day',
  dayOfYear: 'doy',
  week: 'week',
  month: 'month',
  quarter: 'quarter',
  year: 'year',
  decade: 'decade' // meta stuff

};

const expand = f => _sequelize.default.fn('unnest', f); // aggregations


exports.expand = expand;

const min = f => _sequelize.default.fn('min', f);

exports.min = min;

const max = f => _sequelize.default.fn('max', f);

exports.max = max;

const sum = f => _sequelize.default.fn('sum', f);

exports.sum = sum;

const average = f => _sequelize.default.fn('avg', f);

exports.average = average;

const median = f => _sequelize.default.fn('median', f);

exports.median = median;

const count = (f = _sequelize.default.literal('*')) => _sequelize.default.fn('count', f); // math


exports.count = count;

const gt = (a, b) => _sequelize.default.fn('gt', numeric(a), numeric(b));

exports.gt = gt;

const lt = (a, b) => _sequelize.default.fn('lt', numeric(a), numeric(b));

exports.lt = lt;

const gte = (a, b) => _sequelize.default.fn('gte', numeric(a), numeric(b));

exports.gte = gte;

const lte = (a, b) => _sequelize.default.fn('lte', numeric(a), numeric(b));

exports.lte = lte;

const eq = (a, b) => _sequelize.default.fn('eq', numeric(a), numeric(b));

exports.eq = eq;

const add = (a, b) => _sequelize.default.fn('add', numeric(a), numeric(b));

exports.add = add;

const subtract = (a, b) => _sequelize.default.fn('sub', numeric(a), numeric(b));

exports.subtract = subtract;

const multiply = (a, b) => _sequelize.default.fn('mult', numeric(a), numeric(b));

exports.multiply = multiply;

const divide = (a, b) => _sequelize.default.fn('div', numeric(a), numeric(b));

exports.divide = divide;

const remainder = (a, b) => _sequelize.default.fn('mod', numeric(a), numeric(b)); // time


exports.remainder = remainder;

const now = () => _sequelize.default.fn('now');

exports.now = now;

const lastWeek = () => _sequelize.default.literal("CURRENT_DATE - INTERVAL '7 days'");

exports.lastWeek = lastWeek;

const lastMonth = () => _sequelize.default.literal("CURRENT_DATE - INTERVAL '1 month'");

exports.lastMonth = lastMonth;

const lastYear = () => _sequelize.default.literal("CURRENT_DATE - INTERVAL '1 year'");

exports.lastYear = lastYear;

const interval = (start, end) => _sequelize.default.fn('sub', ms(end), ms(start));

exports.interval = interval;

const ms = v => _sequelize.default.fn('time_to_ms', v);

exports.ms = ms;

const truncate = (precision, f) => {
  const p = truncates[precision && precision.raw];
  if (!p) throw new _errors.BadRequestError('truncate() expects a valid precision argument');
  return _sequelize.default.fn('date_trunc', p, f);
};

exports.truncate = truncate;

const extract = (part, f) => {
  const p = parts[part && part.raw];
  if (!p) throw new _errors.BadRequestError('extract() expects a valid part argument');
  return _sequelize.default.fn('date_part', p, f);
}; //export const format = (fmt, f) => types.fn('to_char', f, fmt)
// geospatial


exports.extract = extract;

const area = f => _sequelize.default.fn('ST_Area', _sequelize.default.cast(f, 'geography'));

exports.area = area;

const length = f => _sequelize.default.fn('ST_Length', _sequelize.default.cast(f, 'geography'));

exports.length = length;

const intersects = (geo1, geo2) => _sequelize.default.fn('ST_Intersects', _sequelize.default.cast(geo1, 'geometry'), _sequelize.default.cast(geo2, 'geometry'));

exports.intersects = intersects;

const distance = (geo1, geo2) => _sequelize.default.fn('ST_Distance', _sequelize.default.cast(geo1, 'geometry'), _sequelize.default.cast(geo2, 'geometry'));

exports.distance = distance;

const geojson = v => {
  if (!v.raw || typeof v.raw !== 'string') throw new _errors.BadRequestError('geojson() expects a string argument');
  const o = JSON.parse(v.raw);
  if (!(0, _isPureObject.default)(o)) throw new _errors.BadRequestError('geojson() expects a valid object argument');
  if (typeof o.type !== 'string') throw new _errors.BadRequestError('geojson() expects a valid geojson object'); // FeatureCollection

  if (Array.isArray(o.features)) return _sequelize.default.fn('geocollection_from_geojson', v); // Feature

  if (o.geometry) return _sequelize.default.fn('from_geojson', JSON.stringify(o.geometry)); // Anything else

  return _sequelize.default.fn('from_geojson', v);
};

exports.geojson = geojson;

const boundingBox = (xmin, ymin, xmax, ymax) => _sequelize.default.fn('ST_MakeEnvelope', xmin, ymin, xmax, ymax);

exports.boundingBox = boundingBox;