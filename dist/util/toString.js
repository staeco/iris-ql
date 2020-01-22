"use strict";

exports.__esModule = true;
exports.select = exports.column = exports.jsonPath = exports.value = exports.where = void 0;

const table = ({
  model,
  instanceQuery = true
}) => instanceQuery ? model.name : model.getTableName();

const where = ({
  value,
  model,
  instanceQuery = true
}) => model.sequelize.dialect.QueryGenerator.getWhereConditions(value, table({
  model,
  instanceQuery
}), model);

exports.where = where;

const value = ({
  value,
  model,
  instanceQuery = true
}) => model.sequelize.dialect.QueryGenerator.handleSequelizeMethod(value, table({
  model,
  instanceQuery
}), model);

exports.value = value;

const jsonPath = ({
  column,
  model,
  path,
  instanceQuery = true
}) => {
  const ncol = model.sequelize.dialect.QueryGenerator.jsonPathExtractionQuery(column, path) // remove parens it puts on for literally no reason
  .replace(/^\(/, '').replace(/\)$/, '');
  return `"${table({
    model,
    instanceQuery
  })}".${ncol}`;
};

exports.jsonPath = jsonPath;

const column = ({
  column,
  model,
  instanceQuery = true
}) => {
  const ncol = model.sequelize.dialect.QueryGenerator.quoteIdentifier(column);
  return `"${table({
    model,
    instanceQuery
  })}".${ncol}`;
};

exports.column = column;

const select = ({
  value,
  model
}) => model.sequelize.dialect.QueryGenerator.selectQuery(model.getTableName(), value, model);

exports.select = select;