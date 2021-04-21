"use strict";

exports.__esModule = true;
exports.multipolygon = exports.polygon = exports.multiline = exports.line = exports.point = exports.date = exports.boolean = exports.number = exports.text = exports.object = exports.array = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _isNumber = _interopRequireDefault(require("is-number"));

var _humanSchema = require("human-schema");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const wgs84 = 4326;

const geoCast = txt => _sequelize.default.fn('ST_SetSRID', _sequelize.default.fn('ST_GeomFromGeoJSON', txt), wgs84); // Extend human-schema types and:
// - add a hydrate function to go from db text values -> properly typed values
// - make some types more permissive, since queries are often passed in via querystring


const array = { ..._humanSchema.types.array,
  // TODO: recursively map the array against the right types
  // this treats everything as a text array
  // probably need to pass in type and let the db figure out hydrating
  hydrate: txt => _sequelize.default.fn('fix_jsonb_array', txt)
};
exports.array = array;
const object = { ..._humanSchema.types.object,
  hydrate: txt => _sequelize.default.cast(txt, 'jsonb')
};
exports.object = object;
const text = { ..._humanSchema.types.text,
  hydrate: txt => txt
};
exports.text = text;
const number = { ..._humanSchema.types.number,
  test: _isNumber.default,
  hydrate: txt => _sequelize.default.cast(txt, 'numeric')
};
exports.number = number;
const boolean = { ..._humanSchema.types.boolean,
  hydrate: txt => _sequelize.default.cast(txt, 'boolean')
};
exports.boolean = boolean;
const date = { ..._humanSchema.types.date,
  hydrate: txt => _sequelize.default.fn('parse_iso', txt)
};
exports.date = date;
const point = { ..._humanSchema.types.point,
  hydrate: geoCast
};
exports.point = point;
const line = { ..._humanSchema.types.line,
  hydrate: geoCast
};
exports.line = line;
const multiline = { ..._humanSchema.types.multiline,
  hydrate: geoCast
};
exports.multiline = multiline;
const polygon = { ..._humanSchema.types.polygon,
  hydrate: geoCast
};
exports.polygon = polygon;
const multipolygon = { ..._humanSchema.types.multipolygon,
  hydrate: geoCast
};
exports.multipolygon = multipolygon;