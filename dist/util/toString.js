"use strict";

exports.__esModule = true;
exports.select = exports.jsonPath = exports.value = exports.where = void 0;

const where = ({
  value,
  model
}) => model.sequelize.dialect.QueryGenerator.getWhereConditions(value, model.name, model);

exports.where = where;

const value = ({
  value,
  model
}) => model.sequelize.dialect.QueryGenerator.handleSequelizeMethod(value, model.name, model);

exports.value = value;

const jsonPath = ({
  column,
  model,
  path
}) => {
  const ncol = model.sequelize.dialect.QueryGenerator.jsonPathExtractionQuery(column, path) // remove parens it puts on for literally no reason
  .replace(/^\(/, '').replace(/\)$/, '');
  return `"${model.name}".${ncol}`;
};

exports.jsonPath = jsonPath;

const select = ({
  value,
  model
}) => model.sequelize.dialect.QueryGenerator.selectQuery(model.getTableName(), value, model);

exports.select = select;