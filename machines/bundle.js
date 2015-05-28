module.exports = {


  friendlyName: 'Browserify',


  description: 'Bundle the specified files and their dependenies into a single JavaScript file.',


  cacheable: true,


  sync: true,


  inputs: {

    path: {
      description: 'The absolute path to the file (if path is relative, will be resolved from pwd)',
      example: '/Users/mikermcneil/.tmp/foo',
      required: true
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
    task.add(inputs.path);
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
