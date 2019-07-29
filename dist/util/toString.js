"use strict";

exports.__esModule = true;
exports.select = exports.jsonPath = exports.value = exports.where = void 0;

const where = ({
  value,
  table
}) => table.sequelize.dialect.QueryGenerator.getWhereConditions(value, table.name, table);

exports.where = where;

const value = ({
  value,
  table
}) => table.sequelize.dialect.QueryGenerator.handleSequelizeMethod(value, table.name, table);

exports.value = value;

const jsonPath = ({
  column,
  table,
  path
}) => {
  const ncol = table.sequelize.dialect.QueryGenerator.jsonPathExtractionQuery(column, path) // remove parens it puts on for literally no reason
  .replace(/^\(/, '').replace(/\)$/, '');
  return `"${table.name}".${ncol}`;
};

exports.jsonPath = jsonPath;

const select = ({
  value,
  table
}) => table.sequelize.dialect.QueryGenerator.selectQuery(table.name, value, table);

exports.select = select;