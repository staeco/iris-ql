CREATE OR REPLACE FUNCTION geocollection_from_geojson(p_input text) RETURNS geometry AS $$
  SELECT ST_Collect(ST_MakeValid(ST_GeomFromGeoJSON(feat->>'geometry')))
  FROM (SELECT jsonb_array_elements(p_input::jsonb->'features') AS feat) AS f;
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

CREATE OR REPLACE FUNCTION from_geojson(p_input text) RETURNS geometry AS $$
  SELECT ST_MakeValid(ST_GeomFromGeoJSON(p_input));
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;
