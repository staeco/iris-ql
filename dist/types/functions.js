"use strict";

exports.__esModule = true;
exports.boundingBox = exports.geojson = exports.distance = exports.intersects = exports.length = exports.area = exports.extract = exports.truncate = exports.interval = exports.lastYear = exports.lastMonth = exports.lastWeek = exports.now = exports.eq = exports.lte = exports.gte = exports.lt = exports.gt = exports.remainder = exports.divide = exports.multiply = exports.subtract = exports.add = exports.count = exports.median = exports.average = exports.sum = exports.max = exports.min = exports.expand = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _capitalize = _interopRequireDefault(require("capitalize"));

var _decamelize = _interopRequireDefault(require("decamelize"));

var _errors = require("../errors");

var _isPureObject = _interopRequireDefault(require("is-pure-object"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const numeric = info => {
  if (info.raw) {
    if (typeof raw === 'number') return info.raw;

    if (typeof raw === 'string') {
      const parsed = parseFloat(info.raw);
      if (!isNaN(parsed)) return parsed;
    }
  }

  if (info.types.includes('date')) {
    return _sequelize.default.cast(_sequelize.default.fn('time_to_ms', info.value), 'numeric');
  }

  return _sequelize.default.cast(info.value, 'numeric');
};

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
}));
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
})); // Arrays

function _ref(i) {
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
  returns: listInfo => listInfo.types.find(_ref).items,
  execute: listInfo => _sequelize.default.fn('unnest', listInfo.value)
}; // Aggregations

exports.expand = expand;

function _ref2(i) {
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
    const primaryType = valueInfo.types.find(_ref2);
    return {
      type: primaryType,
      measurement: primaryType.measurement
    };
  },
  aggregate: true,
  execute: f => _sequelize.default.fn('min', numeric(f))
};
exports.min = min;

function _ref3(i) {
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
    const primaryType = valueInfo.types.find(_ref3);
    return {
      type: primaryType,
      measurement: primaryType.measurement
    };
  },
  aggregate: true,
  execute: f => _sequelize.default.fn('max', numeric(f))
};
exports.max = max;

function _ref4(i) {
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
    const primaryType = valueInfo.types.find(_ref4);
    return {
      type: primaryType,
      measurement: primaryType.measurement
    };
  },
  aggregate: true,
  execute: f => _sequelize.default.fn('sum', numeric(f))
};
exports.sum = sum;

function _ref5(i) {
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
    const primaryType = valueInfo.types.find(_ref5);
    return {
      type: primaryType,
      measurement: primaryType.measurement
    };
  },
  aggregate: true,
  execute: f => _sequelize.default.fn('avg', numeric(f))
};
exports.average = average;

function _ref6(i) {
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
    const primaryType = valueInfo.types.find(_ref6);
    return {
      type: primaryType,
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

function _ref7(i) {
  return i.type === 'number';
}

function _ref8(i) {
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
    const primaryTypeA = infoA.types.find(_ref7);
    const primaryTypeB = infoB.types.find(_ref8);
    return {
      type: 'number',
      measurement: primaryTypeA.measurement || primaryTypeB.measurement
    };
  },
  execute: (a, b) => _sequelize.default.fn('add', numeric(a), numeric(b))
};
exports.add = add;

function _ref9(i) {
  return i.type === 'number';
}

function _ref10(i) {
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
    const primaryTypeA = infoA.types.find(_ref9);
    const primaryTypeB = infoB.types.find(_ref10);
    return {
      type: 'number',
      measurement: primaryTypeA.measurement || primaryTypeB.measurement
    };
  },
  execute: (a, b) => _sequelize.default.fn('sub', numeric(a), numeric(b))
};
exports.subtract = subtract;

function _ref11(i) {
  return i.type === 'number';
}

function _ref12(i) {
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
    const primaryTypeA = infoA.types.find(_ref11);
    const primaryTypeB = infoB.types.find(_ref12);
    return {
      type: 'number',
      measurement: primaryTypeA.measurement || primaryTypeB.measurement
    };
  },
  execute: (a, b) => _sequelize.default.fn('mult', numeric(a), numeric(b))
};
exports.multiply = multiply;

function _ref13(i) {
  return i.type === 'number';
}

function _ref14(i) {
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
    const primaryTypeA = infoA.types.find(_ref13);
    const primaryTypeB = infoB.types.find(_ref14);
    return {
      type: 'number',
      measurement: primaryTypeA.measurement || primaryTypeB.measurement
    };
  },
  execute: (a, b) => _sequelize.default.fn('div', numeric(a), numeric(b))
};
exports.divide = divide;

function _ref15(i) {
  return i.type === 'number';
}

function _ref16(i) {
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
    const primaryTypeA = infoA.types.find(_ref15);
    const primaryTypeB = infoB.types.find(_ref16);
    return {
      type: 'number',
      measurement: primaryTypeA.measurement || primaryTypeB.measurement
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
const lastWeek = {
  name: 'Last Week',
  notes: 'Returns the date and time for 7 days ago',
  returns: {
    type: 'date'
  },
  execute: () => _sequelize.default.literal("CURRENT_DATE - INTERVAL '7 days'")
};
exports.lastWeek = lastWeek;
const lastMonth = {
  name: 'Last Month',
  notes: 'Returns the date and time for 1 month ago',
  returns: {
    type: 'date'
  },
  execute: () => _sequelize.default.literal("CURRENT_DATE - INTERVAL '1 month'")
};
exports.lastMonth = lastMonth;
const lastYear = {
  name: 'Last Year',
  notes: 'Returns the date and time for 1 year ago',
  returns: {
    type: 'date'
  },
  execute: () => _sequelize.default.literal("CURRENT_DATE - INTERVAL '1 year'")
};
exports.lastYear = lastYear;
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
const truncate = {
  name: 'Truncate',
  notes: 'Returns a date truncated to a certain unit of time',
  signature: [{
    name: 'Unit',
    types: ['text'],
    required: true,
    options: truncates
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
exports.truncate = truncate;
const extract = {
  name: 'Extract',
  notes: 'Extracts a measurement of time from a date',
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
    types: ['point', 'polygon', 'multipolygon', 'line', 'multiline'],
    required: true
  }, {
    name: 'Geometry B',
    types: ['point', 'polygon', 'multipolygon', 'line', 'multiline'],
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
    types: ['point', 'polygon', 'multipolygon', 'line', 'multiline'],
    required: true
  }, {
    name: 'Geometry B',
    types: ['point', 'polygon', 'multipolygon', 'line', 'multiline'],
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
  returns: ['point', 'polygon', 'multipolygon', 'line', 'multiline'],
  execute: ({
    raw
  }) => {
    let o;

    try {
      o = JSON.parse(raw);
    } catch (err) {
      throw new _errors.BadRequestError('Not a valid object!');
    }

    if (!(0, _isPureObject.default)(o)) throw new _errors.BadRequestError('Not a valid object!');
    if (typeof o.type !== 'string') throw new _errors.BadRequestError('Not a valid GeoJSON object!'); // FeatureCollection

    if (Array.isArray(o.features)) return _sequelize.default.fn('geocollection_from_geojson', raw); // Feature

    if (o.geometry) return _sequelize.default.fn('from_geojson', JSON.stringify(o.geometry)); // Anything else

    return _sequelize.default.fn('from_geojson', raw);
  }
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