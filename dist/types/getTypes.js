"use strict";

exports.__esModule = true;
exports.default = void 0;

var _lodash = require("lodash");

var _isQueryValue = _interopRequireDefault(require("../util/isQueryValue"));

var schemaTypes = _interopRequireWildcard(require("./"));

var functions = _interopRequireWildcard(require("./functions"));

var _toSchemaType = _interopRequireDefault(require("./toSchemaType"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const getValueTypes = v => (0, _lodash.sortBy)(Object.entries(schemaTypes).reduce((prev, [type, desc]) => {
  if (!desc || typeof desc.test !== 'function') return prev;
  if (desc.test(v) === true) prev.push({
    type
  });
  return prev;
}, []));

const getJSONTypes = (fieldPath, {
  model,
  subSchemas = {}
}) => {
  const path = fieldPath.split('.');
  const col = path.shift();
  const colInfo = model.rawAttributes[col];
  if (!colInfo) return [];
  const schema = subSchemas[col] || colInfo.subSchema;
  if (!schema) return [];
  const field = path[0];
  const attrDef = schema[field];
  if (!attrDef) return [];
  const desc = schemaTypes[attrDef.type];
  if (!desc) return [];
  return [(0, _lodash.pickBy)({
    type: attrDef.type,
    measurement: attrDef.measurement,
    items: attrDef.items,
    validation: attrDef.validation
  })];
};

const getFieldTypes = (fieldPath, {
  model,
  subSchemas = {}
}) => {
  const desc = model.rawAttributes[fieldPath];
  if (!desc) return [];
  const schemaType = (0, _lodash.pickBy)(_objectSpread(_objectSpread({}, (0, _toSchemaType.default)(desc.type, subSchemas[fieldPath])), {}, {
    name: desc.name,
    notes: desc.notes
  }));
  return schemaType ? [schemaType] : [];
}; // return empty on any invalid condition, `parse` will handle main validation before this function is called


const getTypes = (v, opt = {}) => {
  if (!(0, _isQueryValue.default)(v)) return getValueTypes(v);

  if (v.function) {
    const fn = functions[v.function];
    if (!fn) return []; // dynamic return type based on inputs

    if (typeof fn.returns.dynamic === 'function') {
      const sigArgs = fn.signature || [];
      const args = v.arguments || [];
      const resolvedArgs = sigArgs.map((sig, idx) => {
        const nopt = _objectSpread(_objectSpread({}, opt), {}, {
          context: [...(opt.context || []), 'arguments', idx]
        });

        const argValue = args[idx];
        return {
          types: getTypes(argValue, nopt),
          raw: argValue
        };
      });
      const nv = (0, _lodash.pickBy)(fn.returns.dynamic(resolvedArgs, opt));
      return Array.isArray(nv) ? (0, _lodash.pickBy)(nv) : [nv];
    }

    return Array.isArray(fn.returns.static) ? fn.returns.static : [fn.returns.static];
  }

  if (v.field) {
    if (typeof v.field !== 'string') return [];
    if (v.field.includes('.')) return getJSONTypes(v.field, opt);
    return getFieldTypes(v.field, opt);
  }

  return [];
};

var _default = getTypes;
exports.default = _default;
module.exports = exports.default;