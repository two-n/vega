var Transform = require('./Transform'),
    tuple = require('../dataflow/tuple'),
    expression = require('../parse/expr'),
    log = require('../util/log'),
    C = require('../util/constants');

function Alias(graph) {
  Transform.prototype.init.call(this, graph);
  Transform.addParameters(this, {
    from: {type: "value"},
    to:  {type: "value"}
  });

  return this;
}

var proto = (Alias.prototype = new Transform());

proto.transform = function(input) {
  log.debug(input, ["formulating"]);
  var t = this,
      g = this._graph,
      from = this.param("from"),
      to = this.param("to"),
      signals = this.dependency(C.SIGNALS);

  function set(x) {
    var val = x[from].replace(/[!\"\s#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g, '')

    tuple.set(x, to, val);
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
