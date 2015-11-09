'use strict';
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var mkdirp = require('mkdirp');
var s = require("underscore.string");
var baseutil = require('../base-util.js');
var optionOrPrompt = require('yeoman-option-or-prompt');

module.exports = yeoman.generators.Base.extend({
  _optionOrPrompt: optionOrPrompt,

  initializing: function (args, options) {
    this.argument('arguments', {
      required: false,
      type: String
    });
  },

  prompting: function () {
    if (this.arguments) {
      this.arguments = this.arguments.split(';');
      this.props = {
        component: this.arguments[0],
        version: this.arguments[1],
        shim: this.arguments[2]
      };
    } else {
      var done = this.async();

      // Have Yeoman greet the user.
      this.log(yosay(
        'Welcome to the Jedi Project generator to controller!'
      ));

      var prompts = [{
        name: 'component',
        message: 'What\'s the component name (in bower)?'
      },
      {
        name: 'version',
        message: 'What\'s the component version?',
  	    default: '*'
      },
  	  {
        name: 'shim',
        message: 'What are the shim components?',
  	    default: ''
      }];

      this._optionOrPrompt(prompts, function (props) {
        this.props = props;
        done();
      }.bind(this));
    }
  },

  writing: function () {
    this.replace('bower.json', '"dependencies": {', '"' + this.props.component + '": "' + this.props.version + '",');
    // TODO viana: chamar comando para baixar componente após rodar bower install e pegar os arquivos no "main" para serem copiados no assetsfiles
    this.replace('assetsfiles.json', '"files": [', '{'+
    '  "src": "bower_components/' + this.props.component + '/' + this.props.component + '.js",'+
    '  "dest": "assets/libs/' + this.props.component + '/' + this.props.component + '.js"'+
    '},');
    // TODO viana: adicionar ao paths arquivos js retornados no "main"
    this.replace('main.tpl.js', 'paths: {', '"' + this.props.component + '": "assets/libs/' + this.props.component + '/' + this.props.component + '.js",');
    if (this.props.shim) {
      this.replace('main.tpl.js', 'shim: {', '"' + this.props.component + '": [' + this.props.shim + '],');
    }
  },

  replace: function(path, hook, insert) {
    var file = require("html-wiring").readFileAsString(path);
    if (file.indexOf(hook) != -1) {
      this.write(path, file.replace(hook, hook +  '\n' +  insert ));
    }
  }
});