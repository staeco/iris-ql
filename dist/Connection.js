"use strict";

exports.__esModule = true;
exports.default = void 0;

var _sql = _interopRequireDefault(require("./sql"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Connection {
  constructor(pg, options = {}) {
    this.seed = async () => (0, _sql.default)(this.pg);

    this.createQuery = async schema => {// TODO
    };

    this.executeQuery = async (Model, query) => {
      if (query.hasAnalytics()) {
        const rows = await Model.findAll(_objectSpread({
          raw: true
        }, query.getValue()));
        return rows;
      } // TODO

    };

    this.executeQueryStream = async () => {// TODO
    };

    if (!pg) throw new Error('Missing pg option!');
    this.pg = pg;
    this.options = options;
  }

}

exports.default = Connection;
module.exports = exports.default;