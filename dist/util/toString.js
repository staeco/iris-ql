"use strict";

exports.__esModule = true;
exports.jsonPath = exports.select = exports.value = exports.where = void 0;

const where = (db, {
  value,
  tableName,
  Model
}) => db.dialect.QueryGenerator.getWhereConditions(value, tableName, Model);

exports.where = where;

const value = (db, {
  value,
  tableName,
  Model
}) => db.dialect.QueryGenerator.handleSequelizeMethod(value, tableName, Model);

exports.value = value;

const select = (db, {
  value,
  tableName,
  Model
}) => db.dialect.QueryGenerator.selectQuery(tableName, value, tableName, Model);

exports.select = select;

const jsonPath = (db, {
  column,
  resource,
  path
}) => {
  const ncol = db.dialect.QueryGenerator.jsonPathExtractionQuery(column, path) // remove parens it puts on for literally no reason
  .replace(/^\(/, '').replace(/\)$/, '');
  return `"${resource}".${ncol}`;
};

exports.jsonPath = jsonPath;