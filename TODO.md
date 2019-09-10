## Immediate

- Tests for every function variation
- Test every code path
- More SQL injection tests
- `time_bucket(period)` function for groupings
- Variadic logic and math functions
- Add missing math functions https://www.postgresql.org/docs/11/functions-math.html
- getOptions that returns specific value suggestions for a query path
- Prevent using groupings when aggregations dont support it
- Reduce excess casting for numeric types
- Function name consistency (min/max but average/median/subtract?)

## Future

- Move searchable into something else
- Handle includes?
- Support counting in executeStream
- Remove `toString` wherever possible
- Validate types when used with operators
