module.exports = {


  // TODO: move this to machinepack-machines and flip-flop the dependencies around (~mikermcneil june 6, 2015)
  friendlyName: 'Bundle machinepack',


  description: 'Bundle the specified machinepack into a single JavaScript string for use in the browser.',


  extendedDescription: 'The browserified JavaScript will be exposed within a [umd](https://github.com/forbeslindesay/umd) wrapper.',


  cacheable: true,


  inputs: {

    path: {
      description: 'The absolute path to the machinepack directory (if path is relative, will be resolved from pwd)',
      example: '/Users/mikermcneil/machinepack-whatever',
      required: true
    },

    exportAs: {
      description: 'The variable name under which to expose this machinepack; either on the `window` global, or using the semantics of another detected module system (like AMD/RequireJS).',
      extendedDescription: 'If left unspecified, this will be the `friendlyName` of the machinepack.',
      example: 'Whatever'
    }

  },


  exits: {

    notMachinepack: {
      description: 'The specified path is not the root directory of a machinepack'
    },

    success: {
      variableName: 'browserifiedCode',
      example: '((function(require){(return function (){alert("hi it\'s me" + \n" and i sure am messy");\nvar x = 1+1;\n'
    },

  },


  fn: function (inputs,exits) {
    var Path = require('path');
    var _ = require('lodash');
    var Browserify = require('browserify');
    var MPMachines = require('machinepack-machines');
    var thisPack = require('../');


    // Read and parse the package.json file of the local pack in the specified directory.
    var packPath = Path.resolve(inputs.path);
    MPMachines.readPackageJson({
      dir: packPath
    }).exec({

      // An unexpected error occurred.
      error: exits.error,

      // The specified path is not the root directory of a machinepack
      notMachinepack: exits.notMachinepack,

      // OK.
      success: function(packMetadata) {

        // Because there are dynamic requires in Machine.pack(), we need to explicitly
        // tell Browserify about the machines in the pack.
        var _requires = _.reduce(packMetadata.machines, function (memo, machineIdentity){
          memo.push(Path.resolve(packPath,packMetadata.machineDir,machineIdentity));
          return memo;
        }, []);

        // Configure the browserify task
        var task = Browserify({
          standalone: inputs.exportAs || packMetadata.variableName
        });

        // Tell browserify about the resolved paths to each machine
        // (see above for explanation as to why we have to do this)
        task.require(_requires);

        // Now add the main script (`index.js` file of pack)
        task.add(inputs.path);

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
      }
    });

  }


};
