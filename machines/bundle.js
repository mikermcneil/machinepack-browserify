module.exports = {


  friendlyName: 'Browserify',


  description: 'Bundle the specified script and its required dependencies into a single JavaScript file.',


  cacheable: true,


  inputs: {

    path: {
      description: 'The absolute path to the entry point (if path is relative, will be resolved from pwd)',
      example: '/Users/mikermcneil/.tmp/foo',
      required: true
    },

    requires: {
      friendlyName: 'Additional requires',
      description: 'Other paths to explicitly make available to `require()`.',
      extendedDescription: 'This is useful for situations where dependencies are dynamically required by the script you are browserifying, or if the same is true for any of _its_ dependencies.',
      example: ['/my-code/my-things/something.js']
    }

  },


  exits: {

    success: {
      variableName: 'browserifiedCode',
      example: '((function(require){(return function (){alert("hi it\'s me" + \n" and i sure am messy");\nvar x = 1+1;\n'
    },

  },


  fn: function (inputs,exits) {
    var Browserify = require('browserify');

    var task = Browserify();

    // Add main
    task.add(inputs.path);

    // Add additional requires
    task.require(inputs.requires);

    // Now bundle up the Node scripts into a browser-compatible JavaScript string.
    task.bundle(function (err, buffer) {
      if (err) {
        return exits.error(err);
      }

      try {
        var javascript = buffer.toString();
        return exits.success(javascript);
      }
      catch (e) {
        return exits.error(err);
      }
    });

    // stream usage- to look at later:
    // task.bundle().pipe(process.stdout);

  },


};
