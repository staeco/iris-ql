"use strict";

exports.__esModule = true;
exports.default = exports.groups = void 0;

var _gracefulFs = require("graceful-fs");

var _path = require("path");

const groups = ['misc', 'math', 'json', 'geospatial'].map(name => ({
  name,
  sql: (0, _gracefulFs.readFileSync)((0, _path.join)(__dirname, `./${name}.sql`), 'utf8')
}));
exports.groups = groups;

var _default = async conn => {
  const [[hasPostGIS]] = await conn.query(`SELECT * FROM pg_extension WHERE "extname" = 'postgis'`);
  const all = groups.reduce((p, group) => {
    if (group.name === 'geospatial' && !hasPostGIS) return p; // skip geo stuff if they dont have postgis

    return `${p}-- ${group.name}\n${group.sql}\n`;
  }, '');
  return conn.query(all, {
    useMaster: true
  });
};

exports.default = _default;