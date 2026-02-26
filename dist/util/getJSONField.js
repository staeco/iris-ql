"use strict";

exports.__esModule = true;
exports.default = void 0;
var _sequelize = _interopRequireDefault(require("sequelize"));
var _toString = require("./toString");
var schemaTypes = _interopRequireWildcard(require("../types"));
var _errors = require("../errors");
var _getModelFieldLimit = _interopRequireDefault(require("./getModelFieldLimit"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
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
  if (!colInfo || !fieldLimit.some(i => i.field === col)) {
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