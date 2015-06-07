var Path = require('path');
var MPBrowserify = require('./');
var Filesystem = require('machinepack-fs');

// Bundle the specified files and their dependenies into a single JavaScript file.
MPBrowserify.bundleMachinepack({
  path: '/Users/mikermcneil/code/machinepack-math'
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
