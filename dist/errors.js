"use strict";

exports.__esModule = true;
exports.ValidationError = exports.BadRequestError = void 0;

var _util = require("util");

const inspectOptions = {
  depth: 100,
  breakLength: Infinity
};

function _ref(f) {
  return `\n - ${(0, _util.inspect)(f, inspectOptions)}`;
}

const serializeIssues = fields => fields.map(_ref);

class BadRequestError extends Error {
  constructor(message = 'Bad Request', status = 400) {
    super(message);

    this.toString = () => `${super.toString()} (HTTP ${this.status})`;

    this.message = message;
    this.status = status;
  }

}

exports.BadRequestError = BadRequestError;

class ValidationError extends BadRequestError {
  constructor(fields = []) {
    super();

    this.add = err => {
      if (err.fields) {
        this.fields.push(...err.fields);
        return this;
      }

      if (err instanceof Error) throw err;
      this.fields.push(err);
      return this;
    };

    this.isEmpty = () => this.fields.length === 0;

    this.toString = () => {
      const original = super.toString();
      if (this.isEmpty()) return original; // no custom validation

      return `${original}\nIssues:${serializeIssues(this.fields)}`;
    };

    this.fields = fields;
    if (!Array.isArray(this.fields)) this.fields = [this.fields];
  }

}

exports.ValidationError = ValidationError;