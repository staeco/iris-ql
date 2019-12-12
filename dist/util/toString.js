"use strict";

exports.__esModule = true;
exports.select = exports.jsonPath = exports.value = exports.where = void 0;

const where = ({
  value,
  model,
  instanceQuery = true
}) => model.sequelize.dialect.QueryGenerator.getWhereConditions(value, instanceQuery ? model.name : model.getTableName(), model);

exports.where = where;

const value = ({
  value,
  model,
  instanceQuery = true
}) => model.sequelize.dialect.QueryGenerator.handleSequelizeMethod(value, instanceQuery ? model.name : model.getTableName(), model);

exports.value = value;

const jsonPath = ({
  column,
  model,
  path,
  instanceQuery = true
}) => {
  const ncol = model.sequelize.dialect.QueryGenerator.jsonPathExtractionQuery(column, path) // remove parens it puts on for literally no reason
  .replace(/^\(/, '').replace(/\)$/, '');
  return `"${instanceQuery ? model.name : model.getTableName()}".${ncol}`;
};

exports.jsonPath = jsonPath;

const select = ({
  value,
  model
}) => model.sequelize.dialect.QueryGenerator.selectQuery(model.getTableName(), value, model);

exports.select = select;