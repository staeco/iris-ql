CREATE OR REPLACE FUNCTION from_geojson(p_input text) RETURNS geometry AS $$
  SELECT ST_MakeValid(ST_SetSRID(ST_GeomFromGeoJSON(p_input), 4326));
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

CREATE OR REPLACE FUNCTION from_geojson(p_input jsonb) RETURNS geometry AS $$
  SELECT ST_MakeValid(ST_SetSRID(ST_GeomFromGeoJSON(p_input), 4326));
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

CREATE OR REPLACE FUNCTION from_geojson_collection(p_input text) RETURNS geometry AS $$
  SELECT ST_SetSRID(ST_Union(from_geojson(feat->'geometry')), 4326)
  FROM (SELECT jsonb_array_elements(p_input::jsonb->'features') AS feat) AS f;
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

CREATE OR REPLACE FUNCTION from_geojson_collection(p_input jsonb) RETURNS geometry AS $$
  SELECT ST_SetSRID(ST_Union(from_geojson(feat->'geometry')), 4326)
  FROM (SELECT jsonb_array_elements(p_input->'features') AS feat) AS f;
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;
