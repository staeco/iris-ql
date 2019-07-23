"use strict";

exports.__esModule = true;
exports.default = void 0;

var _sql = _interopRequireDefault(require("../sql"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Connection {
  constructor(db, options = {}) {
    this.tables = () => this.db.models;

    this.seed = async () => (0, _sql.default)(this.db);

    if (!db) throw new Error('Missing db option!');
    this.db = db;
    this.options = options;
  }

}

exports.default = Connection;
module.exports = exports.default;