'use strict';
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var mkdirp = require('mkdirp');
var s = require("underscore.string");
var baseutil = require('../base-util.js');
var optionOrPrompt = require('yeoman-option-or-prompt');

String.prototype.capitalize = function() {
    return s(this).capitalize().value();
}

String.prototype.decapitalize = function() {
    return s(this).decapitalize().value();
}

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
        title: this.arguments[0],
        module: this.arguments[1],
        submodule: this.arguments[2],
        controller: this.arguments[3],
        destinationRoot : this.arguments[4]         

      };
    } else {
      var done = this.async();

      // Have Yeoman greet the user.
      this.log(yosay(
        'Welcome to the CI&T Angular Reference Architecture generator to controller!'
      ));

      var prompts = [{
        name: 'title',
        message: 'What\'s the modal title?'
      },
      {
        name: 'module',
        message: 'What\'s the module?',
  	  default: 'core'
      },
  	  {
        name: 'submodule',
        message: 'What\'s the submodule (optional)?',
  	  default: ''
      },
  	  {
        name: 'controller',
        message: 'What\'s the controller name (e.g.: OrderManager)?'
      },
      {
	    name: 'destinationRoot',
		message: 'What\'s the destination root?',
		default: '.'
       }];

      this._optionOrPrompt(prompts, function (props) {
        this.props = props;
        done();
      }.bind(this));
    }
  },

  writing: function () {
    
    console.log('destinationRoot controller antes: ' + this.props.destinationRoot);    
      
    // Froce / in the end. 
    this.props.destinationRoot = this.props.destinationRoot.replace(/\/?$/, '/');
      
    console.log('destinationRoot controller depois: ' + this.props.destinationRoot);  
      
    this.destinationRoot(this.props.destinationRoot);
      
    // Cria a estrutura básica de diretórios   
    var dest = baseutil.createStructure(this.props.module, this.props.submodule, this.props.controller);

  	// controller
    this.fs.copyTpl(
      this.templatePath('ctrl.js'),
      this.destinationPath(dest + '/' + this.props.controller.toLowerCase() + '-ctrl.js'),
	  this
    );

    this.fs.copyTpl(
      this.templatePath('view.html'),
      this.destinationPath(dest + '/' + this.props.controller.toLowerCase() + '.html'),
    this
    );
  }
});