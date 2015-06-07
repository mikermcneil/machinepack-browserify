var Path = require('path');
var _ = require('lodash');
var Browserify = require('./');
var Filesystem = require('machinepack-fs');

// a hack to make this work b/c of dynamic requires in Machine.pack()
// (TODO: make a new machine that is "bundle-machinepack")
var packPath = '/code/machinepack-math';
var pkgJson = require(Path.resolve(packPath, 'package.json'));

var _requires = _.reduce(pkgJson.machinepack.machines, function (memo, machineIdentity){
  memo.push(Path.resolve(packPath,pkgJson.machinepack.machineDir,machineIdentity));
  return memo;
}, []);
// console.log('!',_requires);

// e.g. [
//   '/code/machinepack-math/machines/add',
//   '/code/machinepack-math/machines/subtract'
// ]

// Bundle the specified files and their dependenies into a single JavaScript file.
Browserify.bundle({
  path: './experiment.js',
  requires: _requires
}).exec({
  // An unexpected error occurred.
  error: function(err) {
    console.error('An error occurred:',err.stack);
  },
  // OK.
  success: function (code) {

    var destPath = Path.resolve(__dirname,'./browserified-script.js');

    // Generate a file on the local filesystem using the specified utf8 string as its contents.
    Filesystem.write({
      destination: destPath,
      string: code,
      force: true
    }).exec({
      // An unexpected error occurred.
      error: function(err) {
        console.error('An error occurred:',err.stack);
      },
      // OK.
      success: function() {
        console.log('ok! New JavaScript file created at %s.',destPath);
      }
    });

  }
});
