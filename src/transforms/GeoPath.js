var d3 = require('d3'),
    util = require('datalib/src/util'),
    Tuple = require('vega-dataflow/src/Tuple'),
    log = require('vega-logging'),
    Geo = require('./Geo'),
    Transform = require('./Transform');

function GeoPath(graph) {
  Transform.prototype.init.call(this, graph);
  Transform.addParameters(this, Geo.Parameters);
  Transform.addParameters(this, {
    field: {type: 'field', default: null},
    centroid: {type: "value", default: "false"},
  });

  this._output = {
    "path": "layout_path",
    "centroid": "layout_centroid"
  };
  return this;
}

var prototype = (GeoPath.prototype = Object.create(Transform.prototype));
prototype.constructor = GeoPath;

prototype.transform = function(input) {
  log.debug(input, ['geopath']);

  var output = this._output,
      geojson = this.param('field').accessor || util.identity,
      proj = Geo.d3Projection.call(this),
      path = d3.geo.path().projection(proj);
      centroid = this.param("centroid");

  function set(t) {
    Tuple.set(t, output.path, path(geojson(t)));
    if (centroid) {
      useableCentroid = path.centroid(geojson(t))
      if (t.properties.centroid) {
        useableCentroid = path.projection()(t.properties.centroid)
      }

      tuple.set(t, output.centroid, useableCentroid);
    }
  }

  input.add.forEach(set);
  if (this.reevaluate(input)) {
    input.mod.forEach(set);
    input.rem.forEach(set);
  }

  input.fields[output.path] = 1;
  if (centroid) {
    input.fields[output.centroid] = 1;
  }
  return input;
};

module.exports = GeoPath;

GeoPath.schema = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "GeoPath transform",
  "description": "Creates paths for geographic regions, such as countries, states and counties.",
  "type": "object",
  "properties": util.extend({
    "type": {"enum": ["geopath"]},
    "field": {
      "description": "The data field containing GeoJSON Feature data.",
      "oneOf": [{"type": "string"}, {"$ref": "#/refs/signal"}]
    },
    "output": {
      "type": "object",
      "description": "Rename the output data fields",
      "properties": {
        "path": {"type": "string", "default": "layout_path"}
      }
    }
  }, Geo.baseSchema),
  "required": ["type"]
};
