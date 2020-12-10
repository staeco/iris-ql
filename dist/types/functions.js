"use strict";

exports.__esModule = true;
exports.boundingBox = exports.geojson = exports.distance = exports.intersects = exports.length = exports.area = exports.extract = exports.bucket = exports.interval = exports.last = exports.now = exports.eq = exports.lte = exports.gte = exports.lt = exports.gt = exports.remainder = exports.percentage = exports.divide = exports.multiply = exports.subtract = exports.add = exports.count = exports.median = exports.average = exports.sum = exports.max = exports.min = exports.expand = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _capitalize = _interopRequireDefault(require("capitalize"));

var _decamelize = _interopRequireDefault(require("decamelize"));

var _momentTimezone = _interopRequireDefault(require("moment-timezone"));

var _ = require("./");

var _tz = require("../util/tz");

var _isPlainObj = _interopRequireDefault(require("is-plain-obj"));

var _prettyMs = _interopRequireDefault(require("pretty-ms"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const wgs84 = 4326; // some operations we don't want to display a percentage after, for example:
// 33% * 100,000 should return 33,000 as a flat integer
// 100,000 / 77% should return 130,000 as a flat integer

const isPercentage = i => i.measurement?.type === 'percentage';

const inheritNumeric = ({
  retainPercentage
}, [infoA, infoB]) => {
  const filter = i => (i.type === 'number' || i.type === 'date') && (retainPercentage || !isPercentage(i));

  const primaryTypeA = infoA?.types.find(filter);
  const primaryTypeB = infoB?.types.find(filter);
  return {
    type: primaryTypeA?.type || primaryTypeB?.type,
    measurement: primaryTypeA?.measurement || primaryTypeB?.measurement
  };
};

function _ref(i) {
  return i.type;
}

const numeric = info => {
  if (info.value.type === 'numeric') return info.value; // already cast as numeric

  const flatTypes = info.types.map(_ref); //if (flatTypes.includes('number')) return info.value // already a number

  if (flatTypes.includes('date')) {
    return _sequelize.default.fn('time_to_ms', info.value);
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

  if (!(0, _isPlainObj.default)(o)) return 'geometry'; // FeatureCollection

  if (Array.isArray(o.features)) return 'geometry'; // Feature

  if (o.geometry) return getGeoReturnType(JSON.stringify(o.geometry)); // Regular types

  if (_.point.test(o) === true) return 'point';
  if (_.line.test(o) === true) return 'line';
  if (_.multiline.test(o) === true) return 'multiline';
  if (_.polygon.test(o) === true) return 'polygon';
  if (_.multipolygon.test(o) === true) return 'multipolygon';
  return 'geometry';
};

const getGeometryValue = raw => {
  let o;

  try {
    o = JSON.parse(raw);
  } catch (err) {
    throw new Error('Not a valid object!');
  }

  if (!(0, _isPlainObj.default)(o)) throw new Error('Not a valid object!');
  if (typeof o.type !== 'string') throw new Error('Not a valid GeoJSON object!'); // FeatureCollection

  if (Array.isArray(o.features)) return _sequelize.default.fn('from_geojson_collection', raw); // Feature

  if (o.geometry) return getGeometryValue(JSON.stringify(o.geometry)); // Anything else

  return _sequelize.default.fn('from_geojson', raw);
};

const partsToDB = {
  hourOfDay: 'hour',
  dayOfWeek: 'isodow',
  dayOfMonth: 'day',
  dayOfYear: 'doy',
  week: 'week',
  month: 'month',
  customMonth: 'custom_month',
  quarter: 'quarter',
  customQuarter: 'custom_quarter',
  year: 'year',
  customYear: 'custom_year',
  decade: 'decade'
};
const parts = Object.keys(partsToDB).map(k => ({
  value: k,
  label: _capitalize.default.words((0, _decamelize.default)(k, ' '))
}));
const truncatesToDB = {
  second: 'second',
  minute: 'minute',
  hour: 'hour',
  day: 'day',
  week: 'week',
  month: 'month',
  quarter: 'quarter',
  customQuarter: 'custom_quarter',
  year: 'year',
  customYear: 'custom_year',
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
  name: 'Expand List',
  notes: 'Expands a list to a set of rows',
  signature: [{
    name: 'List',
    types: ['array'],
    required: true
  }],
  returns: {
    static: {
      type: 'any'
    },
    dynamic: ([listInfo]) => listInfo.types.find(_ref2).items
  },
  execute: ([listInfo]) => _sequelize.default.fn('unnest', listInfo.value)
}; // Aggregations

exports.expand = expand;
const min = {
  name: 'Minimum',
  notes: 'Aggregates the minimum value of a number',
  signature: [{
    name: 'Value',
    types: ['number', 'date'],
    required: true
  }],
  returns: {
    static: {
      type: 'number'
    },
    dynamic: inheritNumeric.bind(null, {
      retainPercentage: true
    })
  },
  aggregate: true,
  execute: ([f]) => _sequelize.default.fn('min', numeric(f))
};
exports.min = min;
const max = {
  name: 'Maximum',
  notes: 'Aggregates the maximum value of a number',
  signature: [{
    name: 'Value',
    types: ['number', 'date'],
    required: true
  }],
  returns: {
    static: {
      type: 'number'
    },
    dynamic: inheritNumeric.bind(null, {
      retainPercentage: true
    })
  },
  aggregate: true,
  execute: ([f]) => _sequelize.default.fn('max', numeric(f))
};
exports.max = max;
const sum = {
  name: 'Sum',
  notes: 'Aggregates the sum total of a number',
  signature: [{
    name: 'Value',
    types: ['number'],
    required: true
  }],
  returns: {
    static: {
      type: 'number'
    },
    dynamic: inheritNumeric.bind(null, {
      retainPercentage: true
    })
  },
  aggregate: true,
  execute: ([f]) => _sequelize.default.fn('sum', numeric(f))
};
exports.sum = sum;
const average = {
  name: 'Average',
  notes: 'Aggregates the average of a number',
  signature: [{
    name: 'Value',
    types: ['number'],
    required: true
  }],
  returns: {
    static: {
      type: 'number'
    },
    dynamic: inheritNumeric.bind(null, {
      retainPercentage: true
    })
  },
  aggregate: true,
  execute: ([f]) => _sequelize.default.fn('avg', numeric(f))
};
exports.average = average;
const median = {
  name: 'Median',
  notes: 'Aggregates the median of a number',
  signature: [{
    name: 'Value',
    types: ['number'],
    required: true
  }],
  returns: {
    static: {
      type: 'number'
    },
    dynamic: inheritNumeric.bind(null, {
      retainPercentage: true
    })
  },
  aggregate: true,
  execute: ([f]) => _sequelize.default.fn('median', numeric(f))
};
exports.median = median;
const count = {
  name: 'Total Count',
  notes: 'Aggregates the total number of rows',
  returns: {
    static: {
      type: 'number'
    }
  },
  aggregate: true,
  execute: () => _sequelize.default.fn('count', _sequelize.default.literal('*'))
}; // Math

exports.count = count;
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
  returns: {
    static: {
      type: 'number'
    },
    dynamic: inheritNumeric.bind(null, {
      retainPercentage: true
    })
  },
  execute: ([a, b]) => _sequelize.default.fn('add', numeric(a), numeric(b))
};
exports.add = add;
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
  returns: {
    static: {
      type: 'number'
    },
    dynamic: inheritNumeric.bind(null, {
      retainPercentage: true
    })
  },
  execute: ([a, b]) => _sequelize.default.fn('subtract', numeric(a), numeric(b))
};
exports.subtract = subtract;
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
  returns: {
    static: {
      type: 'number'
    },
    dynamic: inheritNumeric.bind(null, {
      retainPercentage: false
    })
  },
  execute: ([a, b]) => _sequelize.default.fn('multiply', numeric(a), numeric(b))
};
exports.multiply = multiply;
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
  returns: {
    static: {
      type: 'number'
    },
    dynamic: inheritNumeric.bind(null, {
      retainPercentage: false
    })
  },
  execute: ([a, b]) => _sequelize.default.fn('divide', numeric(a), numeric(b))
};
exports.divide = divide;
const percentage = {
  name: 'Percentage',
  notes: 'Returns the percentage of Value A in Value B',
  signature: [{
    name: 'Value A',
    types: ['number'],
    required: true
  }, {
    name: 'Value B',
    types: ['number'],
    required: true
  }],
  returns: {
    static: {
      type: 'number',
      measurement: {
        type: 'percentage'
      }
    }
  },
  execute: ([a, b]) => _sequelize.default.fn('divide', numeric(a), numeric(b))
};
exports.percentage = percentage;
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
  returns: {
    static: {
      type: 'number'
    },
    dynamic: inheritNumeric.bind(null, {
      retainPercentage: false
    })
  },
  execute: ([a, b]) => _sequelize.default.fn('modulus', numeric(a), numeric(b))
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
    static: {
      type: 'boolean'
    }
  },
  execute: ([a, b]) => _sequelize.default.fn('gt', numeric(a), numeric(b))
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
    static: {
      type: 'boolean'
    }
  },
  execute: ([a, b]) => _sequelize.default.fn('lt', numeric(a), numeric(b))
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
    static: {
      type: 'boolean'
    }
  },
  execute: ([a, b]) => _sequelize.default.fn('gte', numeric(a), numeric(b))
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
    static: {
      type: 'boolean'
    }
  },
  execute: ([a, b]) => _sequelize.default.fn('lte', numeric(a), numeric(b))
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
    static: {
      type: 'boolean'
    }
  },
  execute: ([a, b]) => _sequelize.default.fn('eq', numeric(a), numeric(b))
}; // Time

exports.eq = eq;
const now = {
  name: 'Now',
  notes: 'Returns the current date and time',
  returns: {
    static: {
      type: 'date'
    }
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
    static: {
      type: 'date'
    }
  },
  execute: ([a], opt) => {
    const {
      raw
    } = a;

    const milli = _momentTimezone.default.duration(raw).asMilliseconds();

    if (milli === 0) throw new Error('Invalid duration!');
    return _sequelize.default.literal(`CURRENT_DATE - INTERVAL ${opt.model.sequelize.escape((0, _prettyMs.default)(milli, {
      verbose: true
    }))}`);
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
    static: {
      type: 'number',
      measurement: {
        type: 'duration',
        value: 'millisecond'
      }
    }
  },
  execute: ([start, end]) => _sequelize.default.fn('subtract', _sequelize.default.fn('time_to_ms', end.value), _sequelize.default.fn('time_to_ms', start.value))
};
exports.interval = interval;
const bucket = {
  name: 'Bucket Date',
  notes: 'Returns a date truncated to a unit of time',
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
    static: {
      type: 'date'
    },
    dynamic: ([p]) => ({
      type: 'date',
      measurement: {
        type: 'bucket',
        value: p.raw
      }
    })
  },
  execute: ([p, f], {
    customYearStart = 1,
    timezone = 'Etc/UTC'
  } = {}) => {
    const trunc = truncatesToDB[p.raw];

    if (trunc.startsWith('custom')) {
      return _sequelize.default.fn('date_trunc_with_custom', trunc, f.value, timezone, customYearStart);
    }

    return _sequelize.default.fn('date_trunc', trunc, f.value, timezone);
  }
};
exports.bucket = bucket;
const extract = {
  name: 'Part of Date',
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
  returns: {
    static: {
      type: 'number'
    },
    dynamic: ([unitInfo]) => ({
      type: 'number',
      measurement: {
        type: 'datePart',
        value: unitInfo.raw
      }
    })
  },
  execute: ([p, f], {
    customYearStart = 1,
    timezone = 'Etc/UTC'
  } = {}) => {
    const part = partsToDB[p.raw];
    const d = (0, _tz.force)(f.value, timezone);

    if (part.startsWith('custom')) {
      return _sequelize.default.fn('date_part_with_custom', part, d, customYearStart);
    }

    return _sequelize.default.fn('date_part', part, d);
  }
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
    static: {
      type: 'number',
      measurement: {
        type: 'area',
        value: 'meter'
      }
    }
  },
  execute: ([f]) => _sequelize.default.fn('ST_Area', _sequelize.default.cast(f.value, 'geography'))
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
    static: {
      type: 'number',
      measurement: {
        type: 'distance',
        value: 'meter'
      }
    }
  },
  execute: ([f]) => _sequelize.default.fn('ST_Length', _sequelize.default.cast(f.value, 'geography'))
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
    static: {
      type: 'boolean'
    }
  },
  execute: ([a, b]) => _sequelize.default.fn('ST_Intersects', _sequelize.default.cast(a.value, 'geometry'), _sequelize.default.cast(b.value, 'geometry'))
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
    static: {
      type: 'number',
      measurement: {
        type: 'distance',
        value: 'meter'
      }
    }
  },
  execute: ([a, b]) => _sequelize.default.fn('ST_Distance', _sequelize.default.cast(a.value, 'geography'), _sequelize.default.cast(b.value, 'geography'))
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
  returns: {
    static: {
      type: 'geometry'
    },
    dynamic: ([a]) => ({
      type: getGeoReturnType(a.raw)
    })
  },
  execute: ([a]) => getGeometryValue(a.raw)
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
    static: {
      type: 'polygon'
    }
  },
  execute: ([xmin, ymin, xmax, ymax]) => _sequelize.default.fn('ST_SetSRID', _sequelize.default.fn('ST_MakeEnvelope', xmin.value, ymin.value, xmax.value, ymax.value), wgs84)
};
exports.boundingBox = boundingBox;