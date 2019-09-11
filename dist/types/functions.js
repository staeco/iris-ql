"use strict";

exports.__esModule = true;
exports.boundingBox = exports.geojson = exports.distance = exports.intersects = exports.length = exports.area = exports.extract = exports.bucket = exports.interval = exports.last = exports.now = exports.eq = exports.lte = exports.gte = exports.lt = exports.gt = exports.remainder = exports.divide = exports.multiply = exports.subtract = exports.add = exports.count = exports.median = exports.average = exports.sum = exports.max = exports.min = exports.expand = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _capitalize = _interopRequireDefault(require("capitalize"));

var _decamelize = _interopRequireDefault(require("decamelize"));

var _moment = _interopRequireDefault(require("moment"));

var _errors = require("../errors");

var _ = require("./");

var _isPlainObject = _interopRequireDefault(require("is-plain-object"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _ref(i) {
  return i.type;
}

const numeric = info => {
  if (info.value.type === 'numeric') return info.value; // already cast as numeric

  const flatTypes = info.types.map(_ref); //if (flatTypes.includes('number')) return info.value // already a number

  if (flatTypes.includes('date')) {
    return _sequelize.default.cast(_sequelize.default.fn('time_to_ms', info.value), 'numeric');
  }

  return _sequelize.default.cast(info.value, 'numeric');
};

const getGeoReturnType = raw => {
  let o;

  try {
    o = JSON.parse(raw);
  } catch (err) {
    return 'geometry';
  }

  if (!(0, _isPlainObject.default)(o)) return 'geometry'; // FeatureCollection

  if (Array.isArray(o.features)) return 'geometry'; // Feature

  if (o.geometry) return getGeoReturnType(JSON.stringify(o.geometry)); // Regular types

  if (_.point.check(o)) return 'point';
  if (_.line.check(o)) return 'line';
  if (_.multiline.check(o)) return 'multiline';
  if (_.polygon.check(o)) return 'polygon';
  if (_.multipolygon.check(o)) return 'multipolygon';
  return 'geometry';
};

const getGeometryValue = raw => {
  let o;

  try {
    o = JSON.parse(raw);
  } catch (err) {
    throw new _errors.BadRequestError('Not a valid object!');
  }

  if (!(0, _isPlainObject.default)(o)) throw new _errors.BadRequestError('Not a valid object!');
  if (typeof o.type !== 'string') throw new _errors.BadRequestError('Not a valid GeoJSON object!'); // FeatureCollection

  if (Array.isArray(o.features)) return _sequelize.default.fn('geocollection_from_geojson', raw); // Feature

  if (o.geometry) return getGeometryValue(JSON.stringify(o.geometry)); // Anything else

  return _sequelize.default.fn('from_geojson', raw);
};

const partsToDB = {
  millisecond: 'milliseconds',
  second: 'second',
  minute: 'minute',
  hourOfDay: 'hour',
  dayOfWeek: 'dow',
  dayOfMonth: 'day',
  dayOfYear: 'doy',
  week: 'week',
  month: 'month',
  quarter: 'quarter',
  year: 'year',
  decade: 'decade'
};
const parts = Object.keys(partsToDB).map(k => ({
  value: k,
  label: _capitalize.default.words((0, _decamelize.default)(k, ' '))
}));
const truncatesToDB = {
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
const truncates = Object.keys(truncatesToDB).map(k => ({
  value: k,
  label: (0, _capitalize.default)(k)
})); // Arrays

function _ref2(i) {
  return i.type === 'array';
}

const expand = {
  name: 'Expand',
  notes: 'Expands a list to a set of rows',
  signature: [{
    name: 'List',
    types: ['array'],
    required: true
  }],
  returns: listInfo => listInfo.types.find(_ref2).items,
  execute: listInfo => _sequelize.default.fn('unnest', listInfo.value)
}; // Aggregations

exports.expand = expand;

function _ref3(i) {
  return min.signature[0].types.includes(i.type);
}

const min = {
  name: 'Minimum',
  notes: 'Aggregates the minimum value of a number',
  signature: [{
    name: 'Value',
    types: ['number', 'date'],
    required: true
  }],
  returns: valueInfo => {
    const primaryType = valueInfo.types.find(_ref3);
    return {
      type: primaryType.type,
      measurement: primaryType.measurement
    };
  },
  aggregate: true,
  execute: f => _sequelize.default.fn('min', numeric(f))
};
exports.min = min;

function _ref4(i) {
  return max.signature[0].types.includes(i.type);
}

const max = {
  name: 'Maximum',
  notes: 'Aggregates the maximum value of a number',
  signature: [{
    name: 'Value',
    types: ['number', 'date'],
    required: true
  }],
  returns: valueInfo => {
    const primaryType = valueInfo.types.find(_ref4);
    return {
      type: primaryType.type,
      measurement: primaryType.measurement
    };
  },
  aggregate: true,
  execute: f => _sequelize.default.fn('max', numeric(f))
};
exports.max = max;

function _ref5(i) {
  return sum.signature[0].types.includes(i.type);
}

const sum = {
  name: 'Sum',
  notes: 'Aggregates the sum total of a number',
  signature: [{
    name: 'Value',
    types: ['number', 'date'],
    required: true
  }],
  returns: valueInfo => {
    const primaryType = valueInfo.types.find(_ref5);
    return {
      type: primaryType.type,
      measurement: primaryType.measurement
    };
  },
  aggregate: true,
  execute: f => _sequelize.default.fn('sum', numeric(f))
};
exports.sum = sum;

function _ref6(i) {
  return average.signature[0].types.includes(i.type);
}

const average = {
  name: 'Average',
  notes: 'Aggregates the average of a number',
  signature: [{
    name: 'Value',
    types: ['number', 'date'],
    required: true
  }],
  returns: valueInfo => {
    const primaryType = valueInfo.types.find(_ref6);
    return {
      type: primaryType.type,
      measurement: primaryType.measurement
    };
  },
  aggregate: true,
  execute: f => _sequelize.default.fn('avg', numeric(f))
};
exports.average = average;

function _ref7(i) {
  return median.signature[0].types.includes(i.type);
}

const median = {
  name: 'Median',
  notes: 'Aggregates the median of a number',
  signature: [{
    name: 'Value',
    types: ['number', 'date'],
    required: true
  }],
  returns: valueInfo => {
    const primaryType = valueInfo.types.find(_ref7);
    return {
      type: primaryType.type,
      measurement: primaryType.measurement
    };
  },
  aggregate: true,
  execute: f => _sequelize.default.fn('median', numeric(f))
};
exports.median = median;
const count = {
  name: 'Count',
  notes: 'Aggregates the total number of rows',
  returns: {
    type: 'number'
  },
  aggregate: true,
  execute: () => _sequelize.default.fn('count', _sequelize.default.literal('*'))
}; // Math

exports.count = count;

function _ref8(i) {
  return i.type === 'number';
}

function _ref9(i) {
  return i.type === 'number';
}

const add = {
  name: 'Add',
  notes: 'Applies addition to multiple numbers',
  signature: [{
    name: 'Value A',
    types: ['number'],
    required: true
  }, {
    name: 'Value B',
    types: ['number'],
    required: true
  }],
  returns: (infoA, infoB) => {
    const primaryTypeA = infoA.types.find(_ref8);
    const primaryTypeB = infoB.types.find(_ref9);
    return {
      type: 'number',
      measurement: (primaryTypeA === null || primaryTypeA === void 0 ? void 0 : primaryTypeA.measurement) || (primaryTypeB === null || primaryTypeB === void 0 ? void 0 : primaryTypeB.measurement)
    };
  },
  execute: (a, b) => _sequelize.default.fn('add', numeric(a), numeric(b))
};
exports.add = add;

function _ref10(i) {
  return i.type === 'number';
}

function _ref11(i) {
  return i.type === 'number';
}

const subtract = {
  name: 'Subtract',
  notes: 'Applies subtraction to multiple numbers',
  signature: [{
    name: 'Value A',
    types: ['number'],
    required: true
  }, {
    name: 'Value B',
    types: ['number'],
    required: true
  }],
  returns: (infoA, infoB) => {
    const primaryTypeA = infoA.types.find(_ref10);
    const primaryTypeB = infoB.types.find(_ref11);
    return {
      type: 'number',
      measurement: (primaryTypeA === null || primaryTypeA === void 0 ? void 0 : primaryTypeA.measurement) || (primaryTypeB === null || primaryTypeB === void 0 ? void 0 : primaryTypeB.measurement)
    };
  },
  execute: (a, b) => _sequelize.default.fn('sub', numeric(a), numeric(b))
};
exports.subtract = subtract;

function _ref12(i) {
  return i.type === 'number';
}

function _ref13(i) {
  return i.type === 'number';
}

const multiply = {
  name: 'Multiply',
  notes: 'Applies multiplication to multiple numbers',
  signature: [{
    name: 'Value A',
    types: ['number'],
    required: true
  }, {
    name: 'Value B',
    types: ['number'],
    required: true
  }],
  returns: (infoA, infoB) => {
    const primaryTypeA = infoA.types.find(_ref12);
    const primaryTypeB = infoB.types.find(_ref13);
    return {
      type: 'number',
      measurement: (primaryTypeA === null || primaryTypeA === void 0 ? void 0 : primaryTypeA.measurement) || (primaryTypeB === null || primaryTypeB === void 0 ? void 0 : primaryTypeB.measurement)
    };
  },
  execute: (a, b) => _sequelize.default.fn('mult', numeric(a), numeric(b))
};
exports.multiply = multiply;

function _ref14(i) {
  return i.type === 'number';
}

function _ref15(i) {
  return i.type === 'number';
}

const divide = {
  name: 'Divide',
  notes: 'Applies division to multiple numbers',
  signature: [{
    name: 'Value A',
    types: ['number'],
    required: true
  }, {
    name: 'Value B',
    types: ['number'],
    required: true
  }],
  returns: (infoA, infoB) => {
    const primaryTypeA = infoA.types.find(_ref14);
    const primaryTypeB = infoB.types.find(_ref15);
    return {
      type: 'number',
      measurement: (primaryTypeA === null || primaryTypeA === void 0 ? void 0 : primaryTypeA.measurement) || (primaryTypeB === null || primaryTypeB === void 0 ? void 0 : primaryTypeB.measurement)
    };
  },
  execute: (a, b) => _sequelize.default.fn('div', numeric(a), numeric(b))
};
exports.divide = divide;

function _ref16(i) {
  return i.type === 'number';
}

function _ref17(i) {
  return i.type === 'number';
}

const remainder = {
  name: 'Remainder',
  notes: 'Applies division to multiple numbers and returns the remainder/modulus',
  signature: [{
    name: 'Value A',
    types: ['number'],
    required: true
  }, {
    name: 'Value B',
    types: ['number'],
    required: true
  }],
  returns: (infoA, infoB) => {
    const primaryTypeA = infoA.types.find(_ref16);
    const primaryTypeB = infoB.types.find(_ref17);
    return {
      type: 'number',
      measurement: (primaryTypeA === null || primaryTypeA === void 0 ? void 0 : primaryTypeA.measurement) || (primaryTypeB === null || primaryTypeB === void 0 ? void 0 : primaryTypeB.measurement)
    };
  },
  execute: (a, b) => _sequelize.default.fn('mod', numeric(a), numeric(b))
}; // Comparisons

exports.remainder = remainder;
const gt = {
  name: 'Greater Than',
  notes: 'Returns true/false if Value A is greater than Value B',
  signature: [{
    name: 'Value A',
    types: ['number', 'date'],
    required: true
  }, {
    name: 'Value B',
    types: ['number', 'date'],
    required: true
  }],
  returns: {
    type: 'boolean'
  },
  execute: (a, b) => _sequelize.default.fn('gt', numeric(a), numeric(b))
};
exports.gt = gt;
const lt = {
  name: 'Less Than',
  notes: 'Returns true/false if Value A is less than Value B',
  signature: [{
    name: 'Value A',
    types: ['number', 'date'],
    required: true
  }, {
    name: 'Value B',
    types: ['number', 'date'],
    required: true
  }],
  returns: {
    type: 'boolean'
  },
  execute: (a, b) => _sequelize.default.fn('lt', numeric(a), numeric(b))
};
exports.lt = lt;
const gte = {
  name: 'Greater Than or Equal',
  notes: 'Returns true/false if Value A is greater than Value B or equal',
  signature: [{
    name: 'Value A',
    types: ['number', 'date'],
    required: true
  }, {
    name: 'Value B',
    types: ['number', 'date'],
    required: true
  }],
  returns: {
    type: 'boolean'
  },
  execute: (a, b) => _sequelize.default.fn('gte', numeric(a), numeric(b))
};
exports.gte = gte;
const lte = {
  name: 'Less Than or Equal',
  notes: 'Returns true/false if Value A is less than Value B or equal',
  signature: [{
    name: 'Value A',
    types: ['number', 'date'],
    required: true
  }, {
    name: 'Value B',
    types: ['number', 'date'],
    required: true
  }],
  returns: {
    type: 'boolean'
  },
  execute: (a, b) => _sequelize.default.fn('lte', numeric(a), numeric(b))
};
exports.lte = lte;
const eq = {
  name: 'Equal',
  notes: 'Returns true/false if Value A is equal to Value B',
  signature: [{
    name: 'Value A',
    types: ['number', 'date'],
    required: true
  }, {
    name: 'Value B',
    types: ['number', 'date'],
    required: true
  }],
  returns: {
    type: 'boolean'
  },
  execute: (a, b) => _sequelize.default.fn('eq', numeric(a), numeric(b))
}; // Time

exports.eq = eq;
const now = {
  name: 'Now',
  notes: 'Returns the current date and time',
  returns: {
    type: 'date'
  },
  execute: () => _sequelize.default.fn('now')
};
exports.now = now;
const last = {
  name: 'Last',
  notes: 'Returns the date and time for any duration into the past',
  signature: [{
    name: 'Duration',
    types: ['text'],
    required: true
  }],
  returns: {
    type: 'date'
  },
  execute: ({
    raw
  }) => {
    const milli = _moment.default.duration(raw).asMilliseconds();

    if (milli === 0) throw new _errors.BadRequestError('Invalid duration');
    return _sequelize.default.literal(`CURRENT_DATE - INTERVAL '${milli} milliseconds'`);
  }
};
exports.last = last;
const interval = {
  name: 'Interval',
  notes: 'Returns the difference in milliseconds between Start and End dates',
  signature: [{
    name: 'Start',
    types: ['date'],
    required: true
  }, {
    name: 'End',
    types: ['date'],
    required: true
  }],
  returns: {
    type: 'number',
    measurement: {
      type: 'duration',
      value: 'millisecond'
    }
  },
  execute: (start, end) => _sequelize.default.fn('sub', _sequelize.default.fn('time_to_ms', end.value), _sequelize.default.fn('time_to_ms', start.value))
};
exports.interval = interval;
const bucket = {
  name: 'Bucket',
  notes: 'Returns a date rounded to a unit of time',
  signature: [{
    name: 'Unit',
    types: ['text'],
    options: truncates,
    required: true
  }, {
    name: 'Date',
    types: ['date'],
    required: true
  }],
  returns: {
    type: 'date'
  },
  execute: (p, f) => _sequelize.default.fn('date_trunc', truncatesToDB[p.raw], f.value)
};
exports.bucket = bucket;
const extract = {
  name: 'Extract',
  notes: 'Converts a date to a unit of time',
  signature: [{
    name: 'Unit',
    types: ['text'],
    required: true,
    options: parts
  }, {
    name: 'Date',
    types: ['date'],
    required: true
  }],
  returns: unitInfo => ({
    type: 'number',
    measurement: {
      type: 'datePart',
      value: unitInfo.raw
    }
  }),
  execute: (p, f) => _sequelize.default.fn('date_part', partsToDB[p.raw], f.value)
}; // Geospatial

exports.extract = extract;
const area = {
  name: 'Area',
  notes: 'Returns the area of a polygon in meters',
  signature: [{
    name: 'Geometry',
    types: ['polygon', 'multipolygon'],
    required: true
  }],
  returns: {
    type: 'number',
    measurement: {
      type: 'area',
      value: 'meter'
    }
  },
  execute: f => _sequelize.default.fn('ST_Area', _sequelize.default.cast(f.value, 'geography'))
};
exports.area = area;
const length = {
  name: 'Length',
  notes: 'Returns the length of a line in meters',
  signature: [{
    name: 'Geometry',
    types: ['line', 'multiline'],
    required: true
  }],
  returns: {
    type: 'number',
    measurement: {
      type: 'distance',
      value: 'meter'
    }
  },
  execute: f => _sequelize.default.fn('ST_Length', _sequelize.default.cast(f.value, 'geography'))
};
exports.length = length;
const intersects = {
  name: 'Intersects',
  notes: 'Returns true/false if two geometries intersect',
  signature: [{
    name: 'Geometry A',
    types: ['point', 'polygon', 'multipolygon', 'line', 'multiline', 'geometry'],
    required: true
  }, {
    name: 'Geometry B',
    types: ['point', 'polygon', 'multipolygon', 'line', 'multiline', 'geometry'],
    required: true
  }],
  returns: {
    type: 'boolean'
  },
  execute: (a, b) => _sequelize.default.fn('ST_Intersects', _sequelize.default.cast(a.value, 'geometry'), _sequelize.default.cast(b.value, 'geometry'))
};
exports.intersects = intersects;
const distance = {
  name: 'Distance',
  notes: 'Returns the distance between two geometries in meters',
  signature: [{
    name: 'Geometry A',
    types: ['point', 'polygon', 'multipolygon', 'line', 'multiline', 'geometry'],
    required: true
  }, {
    name: 'Geometry B',
    types: ['point', 'polygon', 'multipolygon', 'line', 'multiline', 'geometry'],
    required: true
  }],
  returns: {
    type: 'number',
    measurement: {
      type: 'distance',
      value: 'meter'
    }
  },
  execute: (a, b) => _sequelize.default.fn('ST_Distance', _sequelize.default.cast(a.value, 'geometry'), _sequelize.default.cast(b.value, 'geometry'))
};
exports.distance = distance;
const geojson = {
  name: 'Create Geometry',
  notes: 'Returns a geometry from a GeoJSON string',
  signature: [{
    name: 'GeoJSON Text',
    types: ['text'],
    required: true
  }],
  returns: ({
    raw
  }) => ({
    type: getGeoReturnType(raw)
  }),
  execute: ({
    raw
  }) => getGeometryValue(raw)
};
exports.geojson = geojson;
const boundingBox = {
  name: 'Create Bounding Box',
  notes: 'Returns a bounding box polygon for the given coordinates',
  signature: [{
    name: 'X Min',
    types: ['number'],
    required: true
  }, {
    name: 'Y Min',
    types: ['number'],
    required: true
  }, {
    name: 'X Max',
    types: ['number'],
    required: true
  }, {
    name: 'Y Max',
    types: ['number'],
    required: true
  }],
  returns: {
    type: 'polygon'
  },
  execute: (xmin, ymin, xmax, ymax) => _sequelize.default.fn('ST_MakeEnvelope', xmin.value, ymin.value, xmax.value, ymax.value)
};
exports.boundingBox = boundingBox;