"use strict";

exports.__esModule = true;
exports.parse = exports.default = void 0;

var _errors = require("../errors");

var _QueryValue = _interopRequireDefault(require("../QueryValue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const parse = v => {
  const [alias, ...rest] = v.split('.');
  const joinKey = alias.replace('~', '');
  return {
    alias: joinKey,
    field: rest.join('.')
  };
};

exports.parse = parse;

var _default = (v, opt) => {
  const {
    joins,
    hydrateJSON,
    context = []
  } = opt;
  const {
    alias,
    field
  } = parse(v);
  const joinKey = alias.replace('~', '');
  const joinConfig = joins == null ? void 0 : joins[joinKey];

  if (!joinConfig) {
    throw new _errors.ValidationError({
      path: context,
      value: v,
      message: 'Must be a defined join!'
    });
  }

  return new _QueryValue.default({
    field
  }, { ...joinConfig,
    hydrateJSON,
    context,
    instanceQuery: true,
    from: joinKey !== 'parent' ? joinKey : undefined
  }).value();
};

exports.default = _default;