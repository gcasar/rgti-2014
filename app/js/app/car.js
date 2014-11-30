require.config({
  // The shim config allows us to configure dependencies for
  // scripts that do not call define() to register a module
  shim: {
    'underscore': {
      exports: '_'
    },
    'backbone': {
      deps: [
        'underscore',
        'jquery'
      ],
      exports: 'Backbone'
    }
  },
  paths: {
    jquery: 'lib/jquery',
    underscore: 'lib/underscore',
    backbone: 'lib/backbone'
  }
});

define(["underscore", "backbone"], function(_, Backbone) {
return {
    color: "blue",
    size: "large",
    hello: function() {
        console.log("Hello");
    }
}});