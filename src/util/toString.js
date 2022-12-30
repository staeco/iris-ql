// sequelize < 6 uses QueryGenerator, > 6 uses queryGenerator
const getQueryGenerator = (model) => model.sequelize.dialect.queryGenerator || model.sequelize.dialect.QueryGenerator

const table = ({ model, instanceQuery = true }) => instanceQuery ? model.name : model.getTableName()

export const where = ({ value, model, from, instanceQuery = true }) =>
  getQueryGenerator(model).getWhereConditions(value, from || table({ model, instanceQuery }), model)

export const value = ({ value, model, from, instanceQuery = true }) =>
  getQueryGenerator(model).handleSequelizeMethod(value, from || table({ model, instanceQuery }), model)

export const jsonPath = ({ column, model, path, from, instanceQuery = true }) => {
  const ncol = getQueryGenerator(model).jsonPathExtractionQuery(column, path)
    // remove parens it puts on for literally no reason
    .replace(/^\(/, '')
    .replace(/\)$/, '')
  const tbl = getQueryGenerator(model).quoteIdentifier(from || table({ model, instanceQuery }))
  return `${tbl}.${ncol}`
}

export const identifier = ({ value, model }) => getQueryGenerator(model).quoteIdentifier(value)

export const column = ({ column, model, from, instanceQuery = true }) => {
  const ncol = getQueryGenerator(model).quoteIdentifier(column)
  const tbl = getQueryGenerator(model).quoteIdentifier(from || table({ model, instanceQuery }))
  return `${tbl}.${ncol}`
}

export const select = ({ value, model, from, analytics }) => {
  const qg = getQueryGenerator(model)
  const nv = { ...value }

  // prep work findAll usually does
  if (!analytics) {
    // sequelize < 5.10
    if (model._conformOptions) {
      model._injectScope(nv)
      model._conformOptions(nv, model)
      model._expandIncludeAll(nv)
    } else {
      model._injectScope(nv)
      model._conformIncludes(nv, model)
      model._expandAttributes(nv)
      model._expandIncludeAll(nv)
    }
  }

  let basic = qg.selectQuery(from || model.getTableName(), nv, model)
  if (!value.joins) return basic

  // inject joins into the query, sequelize has no way of doing this
  const isUnionAll = !nv.attributes && !nv.group
  let out
  if (!isUnionAll) {
    const injectPoint = `FROM ${qg.quoteIdentifier(model.getTableName())} AS ${qg.quoteIdentifier(model.name)}`
    const joinStr = value.joins
      .filter((j) => basic.includes(qg.quoteIdentifier(j.alias)))
      .map(join)
      .join(' ')
    out = basic.replace(injectPoint, `${injectPoint} ${joinStr}`)
  } else {
    // string joins together into a union all query
    const joinStr = value.joins
      .map(unionAll)
      .join(' ')
    // add alias to primary query to avoid errors
    if (joinStr) basic = basic.replace('SELECT', `SELECT NULL AS _alias,`)
    // inject union statements into end of primary query
    out = basic.replace(';', ` ${joinStr};`)
  }
  return out
}

export const join = ({ where, model, alias, required }) => {
  const qg = getQueryGenerator(model)
  const whereStr = qg.whereItemsQuery(where, {
    prefix: qg.sequelize.literal(qg.quoteIdentifier(alias)),
    model
  })
  const joinType = required ? 'INNER JOIN' : 'LEFT JOIN'
  return `${joinType} ${qg.quoteIdentifier(model.getTableName())} AS ${qg.quoteIdentifier(alias)} ON ${whereStr}`
}


export const unionAll = ({ where, model, alias }) => {
  const qg = getQueryGenerator(model)
  // select statement in format: SELECT alias AS _alias, SELECT * FROM table
  const unionStr = qg.selectQuery(model.getTableName(), where, model)
    .replace('SELECT', `SELECT '${alias}' AS _alias,`)
    .slice(0,-1)
  // return with where statement if applicable
  if (where.length > 1 || Object.keys(where[0]).length > 0) { //if where !== [{}]
    const whereStr = qg.whereItemsQuery(where, {
      model
    })
    return `UNION ALL ${unionStr} WHERE ${whereStr}`
  }
  return `UNION ALL ${unionStr}`
}
