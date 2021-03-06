"use strict";

exports.__esModule = true;
exports.lon = exports.lat = void 0;

/* eslint-disable no-magic-numbers */
const lat = lat => {
  if (typeof lat !== 'number') return `Latitude not a number, got ${typeof lat}`;
  if (lat > 90) return 'Latitude greater than 90';
  if (lat < -90) return 'Latitude less than -90';
  return true;
};

exports.lat = lat;

const lon = lon => {
  if (typeof lon !== 'number') return `Longitude not a number, got ${typeof lon}`;
  if (lon < -180) return 'Longitude less than -180';
  if (lon > 180) return 'Longitude greater than 180';
  return true;
};

exports.lon = lon;