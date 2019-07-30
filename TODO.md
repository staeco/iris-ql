## Future

### General

- Standalone function tests
- Test every code path
- More SQL injection tests
- Remove `toString` wherever possible
- Flesh out casting more, prevent invalid castings and add type safety
- "dataType" option should have to specify the prop, and should be named "subtypes" or something + allow multiple
- Move searchable into something else
- Handle includes?

### Features

- Function type safety
- Support counting in executeStream
- `last(period)` function to replace lastWeek, lastMonth, etc.
- `time_bucket(period)` function for groupings
- Variadic logic and math functions
- Add missing math functions https://www.postgresql.org/docs/11/functions-math.html
