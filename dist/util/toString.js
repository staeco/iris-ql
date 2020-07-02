"use strict";

exports.__esModule = true;
exports.select = exports.column = exports.jsonPath = exports.value = exports.where = void 0;

// sequelize < 6 uses QueryGenerator, > 6 uses queryGenerator
const getQueryGenerator = model => model.sequelize.dialect.queryGenerator || model.sequelize.dialect.QueryGenerator;

const table = ({
  model,
  instanceQuery = true
}) => instanceQuery ? model.name : model.getTableName();

const where = ({
  value,
  model,
  instanceQuery = true
}) => getQueryGenerator(model).getWhereConditions(value, table({
  model,
  instanceQuery
}), model);

exports.where = where;

const value = ({
  value,
  model,
  instanceQuery = true
}) => getQueryGenerator(model).handleSequelizeMethod(value, table({
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
  const ncol = getQueryGenerator(model).jsonPathExtractionQuery(column, path) // remove parens it puts on for literally no reason
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
  const ncol = getQueryGenerator(model).quoteIdentifier(column);
  return `"${table({
    model,
    instanceQuery
  })}".${ncol}`;
};

exports.column = column;

const select = ({
  value,
  model
}) => getQueryGenerator(model).selectQuery(model.getTableName(), value, model);

exports.select = select;