"use strict";

exports.__esModule = true;
exports.default = void 0;

class QueryValue {
  constructor(obj, schema, options = {}) {
    if (!obj) throw new Error('Missing value!');
    this.input = obj;
    this.schema = schema;
    this.options = options;
  }

}

exports.default = QueryValue;
module.exports = exports.default;