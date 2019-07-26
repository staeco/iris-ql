import { readFileSync } from 'graceful-fs'
import { join } from 'path'

export const groups = [
  'misc',
  'math',
  'json',
  'time',
  'geospatial'
].map((name) => ({
  name,
  sql: readFileSync(join(__dirname, `./${name}.sql`), 'utf8')
}))

export default async (conn) => {
  //const [ [ hasPostGIS ] ] = await conn.query(`SELECT * FROM pg_extension WHERE "extname" = 'postgis'`)
  const all = groups.reduce((p, group) =>
    //if (group.name === 'geospatial' && !hasPostGIS) return p // skip geo stuff if they dont have postgis
    `${p}-- ${group.name}\n${group.sql}\n`
  , '')

  return conn.query(all, { useMaster: true })
}
