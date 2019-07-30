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

### add(numeric, numeric) -> numeric
### subtract(numeric, numeric) -> numeric
### divide(numeric, numeric) -> numeric
### modulus(numeric, numeric) -> numeric

## Time

### now() -> date
### lastWeek() -> date
### lastMonth() -> date
### lastYear() -> date
### interval(Start date, End date) -> numeric
### ms(date) -> numeric
### truncate(precision text, date) -> date
### extract(part text, date) -> numeric
### format(format text, date) -> text

## Geospatial

### area(polygon/multipolygon) -> numeric
### length(linestring/multilinestring) -> numeric
### length(linestring/multilinestring) -> numeric
### intersects(A geometry, B geometry) -> boolean
### distance(A geometry, B geometry) -> numeric
### geojson(text) -> geometry
### boundingBox(xmin numeric, ymin numeric, xmax numeric, ymax numeric) -> geometry

## Special

### expand(list)
