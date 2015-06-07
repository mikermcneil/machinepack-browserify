module.exports = {


  friendlyName: 'Bundle script',


  description: 'Bundle the specified script and its required dependencies into a single JavaScript file.',


  cacheable: true,


  inputs: {

    path: {
      description: 'The absolute path to the entry point (if path is relative, will be resolved from pwd)',
      example: '/Users/mikermcneil/.tmp/foo',
      required: true
    },

    exportAs: {
      description: 'The variable name under which to expose any `module.exports` from this script; either on the `window` global, or using the semantics of another detected module system (like AMD/RequireJS).',
      extendedDescription: 'If left unspecified, nothing will be provided to `browserify` as the "standalone" option.',
      example: 'Whatever'
    }

    // Removed this because it doesn't seem to completely work in browserify core.
    // Feel free to bring it back if you need it- but it needs pretty extensive tests
    // to guarantee that it works from different absolute paths.  e.g. it worked for me
    // from `/code/the-pack` but not from `/Users/mikermcneil/code/the-pack` (the root-level
    // "/code" directory is a symlink).  So yeah... I dunno.  That's why I did the transform hack
    // in `bundle-machinepack`.
    // (~mikermcneil, June 7, 2015)
    //
    // requires: {
    //   friendlyName: 'Additional requires',
    //   description: 'Other paths to explicitly make available to `require()`.',
    //   extendedDescription: 'This is useful for situations where dependencies are dynamically required by the script you are browserifying, or if the same is true for any of _its_ dependencies.',
    //   example: ['/my-code/my-things/something.js']
    // }

  },


  exits: {

    success: {
      variableName: 'browserifiedCode',
      example: '((function(require){(return function (){alert("hi it\'s me" + \n" and i sure am messy");\nvar x = 1+1;\n'
    },

  },


  fn: function (inputs,exits) {
    var Browserify = require('browserify');

    var opts = {};
    if (typeof inputs.exportAs !== 'undefined') {
      opts.standalone = inputs.exportAs;
    }
    var task = Browserify(opts);

    // Add main
    task.add(inputs.path);

    // Add additional requires
    // (see note in comments above)
    // task.require(inputs.requires);

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
