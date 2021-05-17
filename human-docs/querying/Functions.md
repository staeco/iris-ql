# Functions

## Aggregations

### min(numeric) -> numeric

Aggregates the minimum value of the given argument.

```js
{
  function: 'min',
  arguments: [
    { field: 'cost' }
  ]
}
```

### max(numeric) -> numeric

Aggregates the maximum value of the given argument.

```js
{
  function: 'max',
  arguments: [
    { field: 'cost' }
  ]
}
```

### sum(numeric) -> numeric

Aggregates the sum value of the given argument.

```js
{
  function: 'sum',
  arguments: [
    { field: 'cost' }
  ]
}
```

### average(numeric) -> numeric

Aggregates the average value of the given argument.

```js
{
  function: 'average',
  arguments: [
    { field: 'cost' }
  ]
}
```

### median(numeric) -> numeric

Aggregates the median value of the given argument.

```js
{
  function: 'median',
  arguments: [
    { field: 'cost' }
  ]
}
```

### count() -> numeric

Aggregates the total count.

```js
{
  function: 'count'
}
```

## Logic

### gt(A numeric, B numeric) -> boolean

Returns true/false if argument A is greater than argument B.

```js
{
  function: 'gt',
  arguments: [
    { field: 'taxCost' }, // A
    { field: 'tollsCost' } // B
  ]
}
```

### lt(A numeric, B numeric) -> boolean

Returns true/false if argument A is less than argument B.

```js
{
  function: 'lt',
  arguments: [
    { field: 'taxCost' }, // A
    { field: 'tollsCost' } // B
  ]
}
```

### gte(A numeric, B numeric) -> boolean

Returns true/false if argument A is greater than or equal to argument B.

```js
{
  function: 'gte',
  arguments: [
    { field: 'taxCost' }, // A
    { field: 'tollsCost' } // B
  ]
}
```

### lte(A numeric, B numeric) -> boolean

Returns true/false if argument A is less than or equal toargument B.

```js
{
  function: 'lte',
  arguments: [
    { field: 'taxCost' }, // A
    { field: 'tollsCost' } // B
  ]
}
```

### eq(A any, B any) -> boolean

Returns true/false if argument A is equal to argument B.

```js
{
  function: 'eq',
  arguments: [
    { field: 'owner' }, // A
    { field: 'operator' } // B
  ]
}
```

## Math

### add(A numeric, B numeric) -> numeric

Adds argument A and argument B together.

```js
{
  function: 'add',
  arguments: [
    { field: 'taxes' }, // A
    { field: 'fare' } // B
  ]
}
```

### subtract(A numeric, B numeric) -> numeric

Subtracts argument B from argument A.

```js
{
  function: 'subtract',
  arguments: [
    { field: 'cost' }, // A
    { field: 'taxes' } // B
  ]
}
```

### multiply(A numeric, B numeric) -> numeric

Multiply argument A by argument B.

```js
{
  function: 'multiply',
  arguments: [
    { field: 'tax' }, // A
    { field: 'passengers' } // B
  ]
}
```

### divide(A numeric, B numeric) -> numeric

Divides argument A by argument B.

```js
{
  function: 'divide',
  arguments: [
    { field: 'cost' }, // A
    { field: 'passengers' } // B
  ]
}
```

### percentage(A numeric, B numeric) -> numeric

Returns the percentage of Value A in Value B.

```js
{
  function: 'percentage',
  arguments: [
    { field: 'tax' }, // A
    { field: 'cost' } // B
  ]
}
```

### remainder(A numeric, B numeric) -> numeric

Returns the remainder left over when argument A is divided by argument B.

```js
{
  function: 'remainder',
  arguments: [
    { field: 'cost' }, // A
    { field: 'passengers' } // B
  ]
}
```

## Time

### now() -> date

Returns the current date.

```js
{
  function: 'now'
}
```

### last(Duration text) -> date

Returns the current date minus a duration specified as an ISO duration.

```js
// One week ago
{
  function: 'last',
  arguments: [ 'P1W' ]
}
```

### interval(start date, end date) -> numeric

Returns the difference in millisecond between the start and end date.

```js
{
  function: 'interval',
  arguments: [
    { field: 'startedAt' },
    { field: 'endedAt' }
  ]
}
```

### ms(date) -> numeric

Returns the millisecond value of a date.

```js
{
  function: 'ms',
  arguments: [
    { field: 'startedAt' },
    { field: 'endedAt' }
  ]
}
```

### truncate(precision text, date) -> date

### extract(part text, date) -> numeric

### format(format text, date) -> text

## Geospatial

### area(polygon/multipolygon) -> numeric

Returns the area of a polygon or multipolygon in meters.

```js
{
  function: 'area',
  arguments: [
    { field: 'shape' }
  ]
}
```

### length(linestring/multilinestring) -> numeric

Returns the total length of a LineString or MultiLineString in meters.

```js
{
  function: 'length',
  arguments: [
    { field: 'path' }
  ]
}
```

### distance(A geometry, B geometry) -> numeric

Returns the distance between two geometries in meters.

```js
{
  function: 'distance',
  arguments: [
    { field: 'startLocation' },
    { field: 'endLocation' }
  ]
}
```

### intersects(A geometry, B geometry) -> boolean

Returns true/false if geometry A intersects with geometry B.

```js
{
  function: 'intersects',
  arguments: [
    { field: 'path' },
    { field: 'zone' }
  ]
}
```

### geojson(text) -> geometry

Returns a geometry from GeoJSON text.

```js
{
  function: 'geojson',
  arguments: [
    '{"type":"Point","coordinates":[1,1]}'
  ]
}
```

### boundingBox(xmin numeric, ymin numeric, xmax numeric, ymax numeric) -> geometry

Returns true/false if geometry A intersects with geometry B.

```js
{
  function: 'boundingBox',
  arguments: [
    0, // xmin
    0, // ymin
    20, // xmax
    20 // ymax
  ]
}
```

## Special

### expand(list)
