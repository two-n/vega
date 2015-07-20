var Transform = require('./Transform'),
    Deps = require('vega-dataflow/src/Dependencies'),
    Tuple = require('vega-dataflow/src/Tuple'),
    expression = require('../parse/expr'),
    log = require('vega-logging')

function Alias(graph) {
  Transform.prototype.init.call(this, graph);
  Transform.addParameters(this, {
    from: {type: "value"},
    to:  {type: "value"}
  });

  return this;
}

// var proto = (Alias.prototype = new Transform());
var prototype = (Alias.prototype = Object.create(Transform.prototype));
prototype.constructor = Alias;

prototype.transform = function(input) {
  log.debug(input, ["formulating"]);

  var g = this._graph,
      from = this.param("field"),
      to = this.param("expr"),
      signals = g.signalValues(this.dependency(Deps.SIGNALS));

  function set(x) {
    var val = x[from].replace(/[!\"\s#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g, '')

    Tuple.set(x, to, val);
  }

  input.add.forEach(set);

  if (this.reevaluate(input)) {
    input.mod.forEach(set);
  }

  input.fields[to] = 1;
  return input;
};

module.exports = Alias;

Alias.schema = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Alias transform",
  "description": "Converts a string to a valid DOM id.",
  "type": "object",
  "properties": {
    "type": {"enum": ["alias"]},
    "from": {
      "type": "string",
      "description": "The property name to transform."
    },
    "to": {
      "type": "string",
      "description": "The property name of the created alias."
    },
  },
  "required": ["type", "field", "expr"]
};
