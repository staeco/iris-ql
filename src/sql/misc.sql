CREATE OR REPLACE FUNCTION null_if_empty_array(a text[]) RETURNS text[] AS $$
  SELECT NULLIF(a, ARRAY[]::text[]);
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

CREATE OR REPLACE FUNCTION dist_sum_func(numeric, anyelement, numeric) RETURNS numeric AS $$
  SELECT CASE WHEN $3 IS NOT NULL THEN COALESCE($1, 0) + $3 ELSE $1 END;
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE;

CREATE OR REPLACE AGGREGATE dist_sum(anyelement, numeric) (
  SFUNC = dist_sum_func,
  STYPE = numeric
);
