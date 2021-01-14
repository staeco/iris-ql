"use strict";

exports.__esModule = true;
exports.default = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _toString = require("./toString");

var schemaTypes = _interopRequireWildcard(require("../types"));

var _errors = require("../errors");

var _getModelFieldLimit = _interopRequireDefault(require("./getModelFieldLimit"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (v, opt) => {
  const {
    context = [],
    subSchemas = {},
    model,
    fieldLimit = (0, _getModelFieldLimit.default)(model),
    instanceQuery,
    from,
    hydrateJSON = true
  } = opt;
  const path = v.split('.');
  const col = path.shift();
  const colInfo = model.rawAttributes[col];

  if (!colInfo || !fieldLimit.find(i => i.field === col)) {
    throw new _errors.ValidationError({
      path: context,
      value: v,
      message: `Field does not exist: ${col}`
    });
  }

  if (!(colInfo.type instanceof _sequelize.default.JSONB || colInfo.type instanceof _sequelize.default.JSON)) {
    throw new _errors.ValidationError({
      path: context,
      value: v,
      message: `Field is not JSON: ${col}`
    });
  }

  const lit = _sequelize.default.literal((0, _toString.jsonPath)({
    column: col,
    model,
    path,
    from,
    instanceQuery
  }));

  const schema = subSchemas[col] || colInfo.subSchema;

  if (!schema) {
    // did not give sufficient info to query json objects safely!
    throw new _errors.ValidationError({
      path: context,
      value: v,
      message: `Field is not queryable: ${col}`
    });
  }

  if (!hydrateJSON) return lit; // asked to keep it raw
  // if a schema is specified, check the type of the field to see if it needs hydrating
  // this is because pg treats all json values as text, so we need to explicitly hydrate types for things
  // to work the way we expect

  const field = path[0];
  const attrDef = schema[field];

  if (!attrDef) {
    throw new _errors.ValidationError({
      path: context,
      value: v,
      message: `Field does not exist: ${col}.${field}`
    });
  }

  return schemaTypes[attrDef.type].hydrate(lit);
};

exports.default = _default;
module.exports = exports.default;