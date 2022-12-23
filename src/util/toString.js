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

  console.log("nv")
  console.log(nv)
  let basic = qg.selectQuery(from || model.getTableName(), nv, model)
  console.log("basic")
  console.log(basic)
  if (!value.joins) return basic
  console.log("here")

  // inject joins into the query, sequelize has no way of doing this
  const isUnionAll = (!nv.attributes && !nv.group)
  let out
  if (!isUnionAll) {
    const injectPoint = `FROM ${qg.quoteIdentifier(model.getTableName())} AS ${qg.quoteIdentifier(model.name)}`
    const joinStr = value.joins
    .filter((j) => basic.includes(qg.quoteIdentifier(j.alias)))
    .map(join)
    .join(' ')
    out = basic.replace(injectPoint, `${injectPoint} ${joinStr}`)
  } else {
    const joinStr = value.joins
    .map(unionAll)
    .join(' ')
    console.log("joinStr")
    console.log(joinStr)
    if (joinStr) basic = basic.replace('SELECT', `SELECT NULL AS _alias,`)
    out = basic.replace(';', ` ${joinStr};`)
  }
  // const injectPoint = `FROM ${qg.quoteIdentifier(model.getTableName())} AS ${qg.quoteIdentifier(model.name)}`
  // console.log("injectPoint")
  // console.log(injectPoint)
  console.log("value.joins")
  console.log(value.joins)
  
  // const joinStr = value.joins
  //   .map(join)
  //   .join(' ')
  // const joinArr = value.joins
  // .map(join)
  // console.log("value.joins.filter((j) => basic.includes(qg.quoteIdentifier(j.alias)))")
  // console.log(value.joins.filter((j) => basic.includes(qg.quoteIdentifier(j.alias))))
  // console.log("joinArr")
  // console.log(joinArr)
  // const out = basic.replace(injectPoint, `${injectPoint} ${joinStr}`)
  console.log("out")
  console.log(out)
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


export const unionAll = ({ where, model, alias, required }) => {
  console.log("join in toString")
  console.log("where")
  console.log(where)
  console.log("model")
  console.log(model)
  console.log("alias")
  console.log(alias)
  console.log("required")
  console.log(required)
  console.log(where.length)
  const qg = getQueryGenerator(model)
  // console.log(this.value())
  const whereStr = qg.whereItemsQuery(where, {
    model
  })
  console.log("whereStr")
  console.log(whereStr)
  const unionStr = qg.selectQuery(model.getTableName(), where, model)
                  .replace('SELECT', `SELECT \'${alias}\' AS _alias,`)
                  .slice(0,-1)
  console.log("unionStr")
  console.log(unionStr)
  console.log("returnStr")
  console.log(`UNION ALL ${unionStr} WHERE ${whereStr}`)
  return `UNION ALL ${unionStr} WHERE ${whereStr}`
  
  // const whereStr = qg.whereItemsQuery(where, {
  //   prefix: qg.sequelize.literal(qg.quoteIdentifier(alias)),
  //   model
  // })
  // const joinType = required ? 'INNER JOIN' : 'LEFT JOIN'
  // return `${joinType} ${qg.quoteIdentifier(model.getTableName())} AS ${qg.quoteIdentifier(alias)} ON ${whereStr}`
}
