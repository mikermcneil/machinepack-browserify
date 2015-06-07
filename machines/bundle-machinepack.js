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
    var util = require('util');
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

        // Configure the browserify task
        var task = Browserify({
          standalone: inputs.exportAs || packMetadata.variableName
        });

        // Now add the main script (`index.js` file of pack)
        task.add(packPath);

        var through = require('through2');
        task.transform(function (filePath, opts){

          // console.log('transforming file "%s" with opts:',filePath,opts);

          // Use `through2` to build a nice little stream that will accumulate
          // the code for us.
          var code = '';
          var stream;
          stream = through.obj(function (buf, enc, next) {
              code += buf.toString('utf8');
              return next();
          }, function onCodeReady(next) {
              var isTopLevelPackIndex = _.endsWith(filePath, Path.join(packPath, 'index.js'));

              // If this is not the `index.js` file of a machinepack, leave
              // the code alone.
              if (!isTopLevelPackIndex) {
                this.push(new Buffer(code));
                return next();
              }

              // TODO:
              // Support other machinepacks required from inside the machines
              // of the top-level pack.

              // If this is a machinepack, replace the index.js file with
              // a browserify-compatible version of the code that does not use
              // Machine.pack() (because browserify doesn't know how to handle
              // dynamic requires).
              var shimCode = _.reduce(packMetadata.machines, function (memo, machineIdentity){
                var line = util.format('  \'%s\': Machine.build( require(\'%s\') ),\n', machineIdentity, './'+Path.join(packMetadata.machineDir,machineIdentity));
                memo += line;
                return memo;
              },
              '// This shim was generated during browserification of this machinepack.\n'+
              '// Because Machine.pack() uses dynamic require() calls, which is not supported \n'+
              '// natively by browserify, the boilerplate index.js file in this pack was automatically\n'+
              '// replaced with explicit requires of each machine herein.\n'+
              'var Machine = require(\'machine\');\n'+
              '\n'+
              'module.exports = {\n');
              shimCode += '};\n';
              // console.log('\n------\n',shimCode,'\n\n');

              this.push(new Buffer(shimCode));
              return next();
          });

          // Provide our new stream to browserify
          return stream;
        });


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
