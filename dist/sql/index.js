"use strict";

exports.__esModule = true;
exports.default = exports.all = exports.groups = void 0;

var _gracefulFs = require("graceful-fs");

var _path = require("path");

const groups = ['misc', 'math', 'json', 'geospatial'].map(name => ({
  name,
  sql: (0, _gracefulFs.readFileSync)((0, _path.join)(__dirname, `./${name}.sql`), 'utf8')
}));
exports.groups = groups;
const all = groups.reduce((p, group) => p += `-- ${group.name}\n${group.sql}\n`, '');
exports.all = all;

var _default = async conn => conn.query(all, {
  useMaster: true
});

exports.default = _default;