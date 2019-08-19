import isObject from 'is-pure-object'
import { fn } from 'sequelize'
import { lat, lon } from '../util/isValidCoordinate'
import intersects from '../util/intersects'
import { ValidationError } from '../errors'
import parseIffyDate from '../util/iffy/date'
import parseIffyNumber from '../util/iffy/number'
import parseIffyStringArray from '../util/iffy/stringArray'
import getScopedAttributes from '../util/getScopedAttributes'
import Filter from '../Filter'
import Ordering from '../Ordering'

export default (query, opt={}) => {
  const error = new ValidationError()
  const { model, context=[] } = opt
  const attrs = getScopedAttributes(model)
  const initialFieldLimit = opt.fieldLimit || Object.keys(attrs)

  // options we pass on, default in fieldLimit
  const out = {
    where: [
      {} // very dumb fix for https://github.com/sequelize/sequelize/issues/10142
    ],
    order: []
  }

  if (query.timezone) {
    if (typeof query.timezone !== 'string') {
      error.add({
        path: [ ...context, 'timezone' ],
        value: query.timezone,
        message: 'Must be a string.'
      })
    } else {
      opt.timezone = query.timezone
      delete query.timezone
    }
  }

  // searching
  if (query.search) {
    const searchable = initialFieldLimit.filter((k) => attrs[k].searchable)
    const isSearchable = searchable.length !== 0
    const isValid = typeof query.search === 'string'
    if (!isValid) {
      error.add({
        path: [ ...context, 'search' ],
        value: query.search,
        message: 'Must be a string.'
      })
    }
    if (!isSearchable) {
      error.add({
        path: [ ...context, 'search' ],
        value: query.search,
        message: 'Endpoint does not support search.'
      })
    }
    if (isValid && isSearchable) {
      const trimmed = query.search.trim()
      out.where.push({
        $or: searchable.map((f) => ({ [f]: { $iLike: `%${trimmed}%` } }))
      })
    }
  }

  // broad time ranges
  if (query.before) {
    try {
      const beforeVal = parseIffyDate(query.before)
      out.where.push({
        $or: [
          { createdAt: { $lt: beforeVal } },
          { updatedAt: { $lt: beforeVal } }
        ]
      })
    } catch (err) {
      error.add({
        path: [ ...context, 'before' ],
        value: query.before,
        message: 'Not a valid date!'
      })
    }
  }
  if (query.after) {
    try {
      const afterVal = parseIffyDate(query.after)
      out.where.push({
        $or: [
          { createdAt: { $gt: afterVal } },
          { updatedAt: { $gt: afterVal } }
        ]
      })
    } catch (err) {
      error.add({
        path: [ ...context, 'after' ],
        value: query.after,
        message: 'Not a valid date!'
      })
    }
  }

  // if they defined a geo bounding box
  if (query.within) {
    if (!isObject(query.within)) {
      error.add({
        path: [ ...context, 'within' ],
        value: query.within,
        message: 'Must be an object.'
      })
    } else {
      const { xmin, ymin, xmax, ymax } = query.within
      const actualXMin = parseIffyNumber(xmin)
      const actualYMin = parseIffyNumber(ymin)
      const actualXMax = parseIffyNumber(xmax)
      const actualYMax = parseIffyNumber(ymax)
      const xminIssue = lon(actualXMin)
      const xmaxIssue = lon(actualXMax)
      const yminIssue = lat(actualYMin)
      const ymaxIssue = lat(actualYMax)
      if (xminIssue !== true) {
        error.add({
          path: [ ...context, 'within', 'xmin' ],
          value: xmin,
          message: xminIssue
        })
      }
      if (yminIssue !== true) {
        error.add({
          path: [ ...context, 'within', 'ymin' ],
          value: ymin,
          message: yminIssue
        })
      }
      if (xmaxIssue !== true) {
        error.add({
          path: [ ...context, 'within', 'xmax' ],
          value: xmax,
          message: xmaxIssue
        })
      }
      if (ymaxIssue !== true) {
        error.add({
          path: [ ...context, 'within', 'ymax' ],
          value: ymax,
          message: ymaxIssue
        })
      }
      const box = fn('ST_MakeEnvelope', actualXMin, actualYMin, actualXMax, actualYMax)
      out.where.push(intersects(box, { model }))
    }
  }

  // if they defined a point
  if (query.intersects) {
    if (!isObject(query.intersects)) {
      error.add({
        path: [ ...context, 'intersects' ],
        value: query.intersects,
        message: 'Must be an object.'
      })
    } else {
      const { x, y } = query.intersects
      const actualX = parseIffyNumber(x)
      const actualY = parseIffyNumber(y)
      const latIssue = lat(actualY)
      const lonIssue = lon(actualX)
      if (lonIssue !== true) {
        error.add({
          path: [ ...context, 'intersects', 'x' ],
          value: x,
          message: lonIssue
        })
      }
      if (latIssue !== true) {
        error.add({
          path: [ ...context, 'intersects', 'y' ],
          value: y,
          message: latIssue
        })
      }
      out.where.push(intersects(fn('ST_Point', actualX, actualY), { model }))
    }
  }

  // exclusions
  if (query.exclusions) {
    const parsed = parseIffyStringArray(query.exclusions).map((k, idx) => {
      const [ first ] = k.split('.')
      if (!first || !attrs[first] || !initialFieldLimit.includes(first)) {
        error.add({
          path: [ ...context, 'exclusions', idx ],
          value: k,
          message: 'Invalid exclusion.'
        })
        return null
      }
      return k
    })
    if (parsed.length !== 0) out.attributes = { exclude: parsed }
  }

  // limit
  if (query.limit) {
    try {
      out.limit = parseIffyNumber(query.limit)
    } catch (err) {
      error.add({
        path: [ ...context, 'limit' ],
        value: query.limit,
        message: 'Invalid limit.'
      })
    }
  }

  // offset
  if (typeof query.offset !== 'undefined') {
    try {
      out.offset = parseIffyNumber(query.offset)
    } catch (err) {
      error.add({
        path: [ ...context, 'offset' ],
        value: query.offset,
        message: 'Invalid offset.'
      })
    }
  }

  // filterings
  if (query.filters) {
    if (!isObject(query.filters) && !Array.isArray(query.filters)) {
      error.add({
        path: [ ...context, 'filters' ],
        value: query.filters,
        message: 'Must be an object or array.'
      })
    } else {
      try {
        out.where.push(new Filter(query.filters, {
          ...opt,
          fieldLimit: initialFieldLimit,
          context: [ ...context, 'filters' ]
        }).value())
      } catch (err) {
        error.add(err)
      }
    }
  }

  // ordering
  if (query.orderings) {
    if (!Array.isArray(query.orderings)) {
      error.add({
        path: [ ...context, 'orderings' ],
        value: query.orderings,
        message: 'Must be an array.'
      })
    } else {
      query.orderings.forEach((v, idx) => {
        try {
          out.order.push(new Ordering(v, {
            ...opt,
            fieldLimit: initialFieldLimit,
            context: [ ...context, 'orderings', idx ]
          }).value())
        } catch (err) {
          error.add(err)
        }
      })
    }
  }

  if (!error.isEmpty()) throw error
  return out
}
