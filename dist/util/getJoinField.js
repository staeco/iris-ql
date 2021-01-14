"use strict";

exports.__esModule = true;
exports.default = void 0;

var _errors = require("../errors");

var _QueryValue = _interopRequireDefault(require("../QueryValue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (v, opt) => {
  const {
    joins,
    hydrateJSON,
    context = []
  } = opt;
  const [alias, ...rest] = v.split('.');
  const joinKey = alias.replace('~', '');
  const joinConfig = joins?.[joinKey];

  if (!joinConfig) {
    throw new _errors.ValidationError({
      path: context,
      value: v,
      message: 'Must be a defined join!'
    });
  }

  return new _QueryValue.default({
    field: rest.join('.')
  }, { ...joinConfig,
    hydrateJSON,
    context,
    instanceQuery: true,
    from: joinKey !== 'parent' ? joinKey : undefined
  }).value();
};

exports.default = _default;
module.exports = exports.default;