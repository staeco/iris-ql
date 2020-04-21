## Immediate

- Tests for every function variation
- Test every code path
- More SQL injection tests
- Add missing math functions https://www.postgresql.org/docs/11/functions-math.html
- getOptions that returns specific value suggestions for a query path
- Prevent using groupings when aggregations dont support it
- Reduce excess casting for numeric types
  - Need more variadic math function overloads!
- Function name consistency (min/max but average/median/subtract?)
- Query.getOutputSchema should respect exclusions, custom attributes added in `.update()`

## Future

- Move searchable into something else
- Handle includes?
- Support counting in executeStream
- Remove `toString` wherever possible
- Validate types when used with operators
