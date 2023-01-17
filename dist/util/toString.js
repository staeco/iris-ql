"use strict";

exports.__esModule = true;
exports.where = exports.value = exports.unionAll = exports.select = exports.jsonPath = exports.join = exports.identifier = exports.column = void 0;
// sequelize < 6 uses QueryGenerator, > 6 uses queryGenerator
const getQueryGenerator = model => model.sequelize.dialect.queryGenerator || model.sequelize.dialect.QueryGenerator;
const table = ({
  model,
  instanceQuery = true
}) => instanceQuery ? model.name : model.getTableName();
const where = ({
  value,
  model,
  from,
  instanceQuery = true
}) => getQueryGenerator(model).getWhereConditions(value, from || table({
  model,
  instanceQuery
}), model);
exports.where = where;
const value = ({
  value,
  model,
  from,
  instanceQuery = true
}) => getQueryGenerator(model).handleSequelizeMethod(value, from || table({
  model,
  instanceQuery
}), model);
exports.value = value;
const jsonPath = ({
  column,
  model,
  path,
  from,
  instanceQuery = true
}) => {
  const ncol = getQueryGenerator(model).jsonPathExtractionQuery(column, path)
  // remove parens it puts on for literally no reason
  .replace(/^\(/, '').replace(/\)$/, '');
  const tbl = getQueryGenerator(model).quoteIdentifier(from || table({
    model,
    instanceQuery
  }));
  return `${tbl}.${ncol}`;
};
exports.jsonPath = jsonPath;
const identifier = ({
  value,
  model
}) => getQueryGenerator(model).quoteIdentifier(value);
exports.identifier = identifier;
const column = ({
  column,
  model,
  from,
  instanceQuery = true
}) => {
  const ncol = getQueryGenerator(model).quoteIdentifier(column);
  const tbl = getQueryGenerator(model).quoteIdentifier(from || table({
    model,
    instanceQuery
  }));
  return `${tbl}.${ncol}`;
};
exports.column = column;
const select = ({
  value,
  model,
  from,
  analytics
}) => {
  const qg = getQueryGenerator(model);
  const nv = {
    ...value
  };

  // prep work findAll usually does
  if (!analytics) {
    // sequelize < 5.10
    if (model._conformOptions) {
      model._injectScope(nv);
      model._conformOptions(nv, model);
      model._expandIncludeAll(nv);
    } else {
      model._injectScope(nv);
      model._conformIncludes(nv, model);
      model._expandAttributes(nv);
      model._expandIncludeAll(nv);
    }
  }
  let basic = qg.selectQuery(from || model.getTableName(), nv, model);
  if (!value.joins) return basic;
  let out;
  function _ref(j) {
    return basic.includes(qg.quoteIdentifier(j.alias));
  }
  if (analytics) {
    const injectPoint = `FROM ${qg.quoteIdentifier(model.getTableName())} AS ${qg.quoteIdentifier(model.name)}`;
    const joinStr = value.joins.filter(_ref).map(join).join(' ');
    out = basic.replace(injectPoint, `${injectPoint} ${joinStr}`);
  } else {
    //if query has join and no analytics, it is a union all
    // string joins together into a union all query
    let joinStr = value.joins.map(unionAll).join(' ');
    if (joinStr) {
      if (value.attributes) {
        // extract attributes from primary select statement
        // const selectSubstring = basic.match(new RegExp('SELECT ' + '(.*)' + ' FROM'))[1]
        const selectSubstring = basic.match(new RegExp('SELECT (.*) FROM'))[1];
        // inject attributes into union statements, replacing '*'
        joinStr = joinStr.replace('*', selectSubstring);
      }
      // add alias to primary query to avoid errors
      basic = basic.replace('SELECT', `SELECT NULL AS _alias,`);
    }
    let statementStart = basic.slice(0, -1); //primary query minus the ';'
    let statementEnd = ';';
    // if limit, separate basic query out to inject limit statement at the end
    if (value.limit) {
      const limitSplit = basic.split(' LIMIT ');
      statementStart = limitSplit[0];
      statementEnd = ` LIMIT ${limitSplit[1]}`;
    }
    // compile final statement
    out = `${statementStart} ${joinStr}${statementEnd}`;
  }
  return out;
};
exports.select = select;
const join = ({
  where,
  model,
  alias,
  required
}) => {
  const qg = getQueryGenerator(model);
  const whereStr = qg.whereItemsQuery(where, {
    prefix: qg.sequelize.literal(qg.quoteIdentifier(alias)),
    model
  });
  const joinType = required ? 'INNER JOIN' : 'LEFT JOIN';
  return `${joinType} ${qg.quoteIdentifier(model.getTableName())} AS ${qg.quoteIdentifier(alias)} ON ${whereStr}`;
};
exports.join = join;
const unionAll = ({
  where,
  model,
  alias
}) => {
  const qg = getQueryGenerator(model);
  // select statement in format: SELECT alias AS _alias, SELECT * FROM table
  const unionStr = qg.selectQuery(model.getTableName(), where, model).replace('SELECT', `SELECT '${alias}' AS _alias,`).slice(0, -1);
  // return with where statement if applicable
  if (where.length > 1 || Object.keys(where[0]).length > 0) {
    //if where !== [{}]
    const whereStr = qg.whereItemsQuery(where, {
      model
    });
    return `UNION ALL ${unionStr} WHERE ${whereStr}`;
  }
  return `UNION ALL ${unionStr}`;
};
exports.unionAll = unionAll;