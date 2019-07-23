"use strict";

exports.__esModule = true;
exports.ValidationError = exports.BadRequestError = exports.codes = void 0;

var _util = require("util");

const inspectOptions = {
  depth: 100,
  breakLength: Infinity
};

const serializeIssues = fields => fields.map(f => `\n - ${(0, _util.inspect)(f, inspectOptions)}`);

const codes = {
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  serverError: 500
};
exports.codes = codes;

class BadRequestError extends Error {
  constructor(message = 'Bad Request', status = codes.badRequest) {
    super(message);
    this.message = message;
    this.status = status;
  }

  toString() {
    return `${super.toString()} (HTTP ${this.status})`;
  }

}

exports.BadRequestError = BadRequestError;

class ValidationError extends BadRequestError {
  constructor(message, fields) {
    super();

    if (message && fields) {
      this.message = message;
      this.fields = fields;
    }

    if (message && !fields) {
      this.fields = message;
    }
  }

  toString() {
    const original = super.toString();
    if (!this.fields) return original; // no custom validation

    return `${original}\nIssues:${serializeIssues(this.fields)}`;
  }

}

exports.ValidationError = ValidationError;