<p align='center'>
  <img src='https://user-images.githubusercontent.com/425716/61729355-00d7c480-ad45-11e9-90ee-6f2947e00515.png' width='400'/>
  <p align='center'>User friendly API query language</p>
</p>

# iris-ql [![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url]

Iris is a safe and user-friendly query system for building flexible APIs with intuitive UIs to match. Check out the docs folder to get started!

## Install

```
npm install iris-ql --save
```

## Basic Example

```js
import { Query } from 'iris-ql'

// Find all crimes by criminal 1 or 2 after 2017
const query = new Query({
  limit: 100,
  filters: {
    createdAt: { $gt: '2017-05-13T00:00:00.000Z' },
    $or: [
      { name: 'Criminal 1' },
      { name: 'Criminal 2' }
    ]
  },
  orderings: [
    { value: { field: 'createdAt' }, direction: 'desc' }
  ]
}, { model: crime })

const results = await query.execute()
```

## Analytics Example

```js
import { AnalyticsQuery } from 'iris-ql'

// get a time series of all 911 calls
const crimeTimeSeries = new AnalyticsQuery({
  filters: {
    data: {
      receivedAt: { $ne: null }
    }
  },
  aggregations: [
    { value: { function: 'count' }, alias: 'total' },
    {
      alias: 'day',
      value: {
        function: 'bucket',
        arguments: [
          'day',
          { field: 'data.receivedAt' }
        ]
      }
    }
  ],
  orderings: [
    { value: { field: 'day' }, direction: 'desc' }
  ],
  groupings: [
    { field: 'day' }
  ]
}, { model: emergencyCall })

const results = await crimeTimeSeries.execute()

/*
[
  { total: 20, day: '2017-05-13T00:00:00.000Z' },
  { total: 3, day: '2017-05-14T00:00:00.000Z' },
  { total: 2, day: '2017-05-15T00:00:00.000Z' }
]
*/
```

## Streaming Mode

If you intend on using streaming mode, you should add this to your package.json:

```json
"resolutions": {
  "pg-cursor": "github:contra/node-pg-cursor#patch-1"
},
```

pg-cursor has an upstream issue with DB types not being used correctly on cursors. This note will be removed once the PR is merged there.


## DB Support

Currently only works with Postgres. In the future, the database layer will be broken out into adapters and multiple stores will be supported.

[downloads-image]: http://img.shields.io/npm/dm/iris-ql.svg
[npm-url]: https://npmjs.org/package/iris-ql
[npm-image]: http://img.shields.io/npm/v/iris-ql.svg

[travis-url]: https://travis-ci.org/staeco/iris-ql
[travis-image]: https://travis-ci.org/staeco/iris-ql.png?branch=master
