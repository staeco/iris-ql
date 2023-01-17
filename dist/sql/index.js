"use strict";

exports.__esModule = true;
exports.groups = exports.default = void 0;

var _gracefulFs = require("graceful-fs");

var _path = require("path");

const groups = ['misc', 'math', 'json', 'time', 'geospatial', 'custom-year'].map(name => ({
  name,
  sql: (0, _gracefulFs.readFileSync)((0, _path.join)(__dirname, `./${name}.sql`), 'utf8')
}));
exports.groups = groups;

function _ref(p, group) {
  return (//if (group.name === 'geospatial' && !hasPostGIS) return p // skip geo stuff if they dont have postgis
    `${p}-- ${group.name}\n${group.sql}\n`
  );
}

var _default = async conn => {
  //const [ [ hasPostGIS ] ] = await conn.query(`SELECT * FROM pg_extension WHERE "extname" = 'postgis'`)
  const all = groups.reduce(_ref, '');
  return conn.query(all, {
    useMaster: true
  });
};

exports.default = _default;