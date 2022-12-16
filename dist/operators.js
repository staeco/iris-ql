"use strict";

exports.__esModule = true;
exports.default = void 0;
var _sequelize = require("sequelize");
var _default = {
  $eq: _sequelize.Op.eq,
  $ne: _sequelize.Op.ne,
  $gte: _sequelize.Op.gte,
  $gt: _sequelize.Op.gt,
  $lte: _sequelize.Op.lte,
  $lt: _sequelize.Op.lt,
  $not: _sequelize.Op.not,
  $in: _sequelize.Op.in,
  $notIn: _sequelize.Op.notIn,
  $is: _sequelize.Op.is,
  $like: _sequelize.Op.like,
  $notLike: _sequelize.Op.notLike,
  $iLike: _sequelize.Op.iLike,
  $notILike: _sequelize.Op.notILike,
  $regexp: _sequelize.Op.regexp,
  $notRegexp: _sequelize.Op.notRegexp,
  $iRegexp: _sequelize.Op.iRegexp,
  $notIRegexp: _sequelize.Op.notIRegexp,
  $between: _sequelize.Op.between,
  $notBetween: _sequelize.Op.notBetween,
  $overlap: _sequelize.Op.overlap,
  $contains: _sequelize.Op.contains,
  $contained: _sequelize.Op.contained,
  $adjacent: _sequelize.Op.adjacent,
  $strictLeft: _sequelize.Op.strictLeft,
  $strictRight: _sequelize.Op.strictRight,
  $noExtendRight: _sequelize.Op.noExtendRight,
  $noExtendLeft: _sequelize.Op.noExtendLeft,
  $and: _sequelize.Op.and,
  $or: _sequelize.Op.or,
  $any: _sequelize.Op.any,
  $all: _sequelize.Op.all,
  $values: _sequelize.Op.values
};
exports.default = _default;
module.exports = exports.default;