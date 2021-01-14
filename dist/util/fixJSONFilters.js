"use strict";

exports.__esModule = true;
exports.hydrate = exports.unwrap = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _toString = require("./toString");

var _getJSONField = _interopRequireDefault(require("./getJSONField"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const jsonField = /"(\w*)"\."(\w*)"#>>'{(\w*)}'/; // sometimes sequelize randomly wraps json access in useless parens, so unwrap everything

const wrapped = /\("(\w*)"\."(\w*)"#>>'{(\w*)}'\)/g;

function _ref(match, table, col, field) {
  return `"${table}"."${col}"#>>'{${field}}'`;
}

const unwrap = (v, opt) => {
  if (Array.isArray(v)) v = {
    $and: v
  }; // convert it

  const str = (0, _toString.where)({ ...opt,
    value: v
  });
  if (!jsonField.test(str)) return v; // nothing to do! no fields to hydrate

  const redone = str.replace(wrapped, _ref);
  return _sequelize.default.literal(redone);
};

exports.unwrap = unwrap;

const hydrate = (v, opt) => {
  if (Array.isArray(v)) v = {
    $and: v
  }; // convert it

  const str = (0, _toString.where)({ ...opt,
    value: v
  });
  if (!jsonField.test(str)) return v; // nothing to do! no fields to hydrate

  const fixing = (0, _toString.identifier)({ ...opt,
    value: opt.from || opt.model.name
  }); // if the field is followed by " IS" then skip, because we dont need to hydrate that
  // since its either IS NULL or IS NOT NULL

  const needsCasting = new RegExp(`${fixing}\\."(\\w*)"#>>'{(\\w*)}'(?! (IS NULL|IS NOT NULL))`, 'g');
  const redone = str.replace(needsCasting, (match, col, field) => {
    const lit = (0, _getJSONField.default)(`${col}.${field}`, opt);
    return (0, _toString.value)({ ...opt,
      value: lit
    });
  });
  return _sequelize.default.literal(redone);
};

exports.hydrate = hydrate;