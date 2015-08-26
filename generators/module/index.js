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
    this.argument('moduleName', {
      required: false,
      type: String,
      desc: 'The module name'
    });
  },

  prompting: function () {
    if (this.moduleName) {
      this.moduleName = this.moduleName.split(';');
      this.props = {
        moduleName: this.moduleName[0],
        useI18n: this.moduleName[1],
        defaultLang: this.moduleName[2],
        destinationRoot : this.moduleName[3]
      };
    } else {
      var done = this.async();

      // Have Yeoman greet the user.
      this.log(yosay(
        'Welcome to the CI&T Angular Reference Architecture generator to module!'
      ));

      var prompts = [{
          name: 'moduleName',
          message: 'What\'s the module name?'
        },
      {
        name: 'defaultLang',
        message: 'What\'s your principal language?',
        default: 'en'
      },
        {
          type: 'confirm',
          name: 'useI18n',
          message: 'Would you like to use the i18n component?',
          default: true
        },
      {
	    name: 'destinationRoot',
		message: 'What\'s the destination root?',
		default: '.'
       }
      ];

      this._optionOrPrompt(prompts, function (props) {
        this.props = props;
        done();
      }.bind(this));
    }
  },

  writing: function () {
      
    console.log('destinationRoot module antes: ' + this.props.destinationRoot);  
      
    // Froce / in the end. 
    this.props.destinationRoot = this.props.destinationRoot.replace(/\/?$/, '/');
      
    console.log('destinationRoot module depois: ' + this.props.destinationRoot);  
      
    this.props.useI18n = JSON.parse(this.props.useI18n);
      
    this.destinationRoot(this.props.destinationRoot);
    //----
    // structure
    mkdirp(this.props.destinationRoot +'app/'+this.props.moduleName.toLowerCase());
    mkdirp(this.props.destinationRoot +'app/'+this.props.moduleName.toLowerCase()+'/components');
    mkdirp(this.props.destinationRoot +'app/'+this.props.moduleName.toLowerCase()+'/env');
    mkdirp(this.props.destinationRoot +'app/'+this.props.moduleName.toLowerCase()+'/features');

    if (this.props.useI18n) {
      mkdirp(this.props.destinationRoot +'app/'+this.props.moduleName.toLowerCase()+'/i18n');
    }

    //----
    // templates

    this.fs.copyTpl(
      this.templatePath('app.js'),
      this.destinationPath('app/'+this.props.moduleName.toLowerCase()+'/'+this.props.moduleName.toLowerCase()+'-app.js'),
      this
    );

    //----
    // statics

    this.fs.copy(
      this.templatePath('env/env.develop.json'),
      this.destinationPath('app/'+this.props.moduleName.toLowerCase()+'/env/'+this.props.moduleName.toLowerCase()+'-env.develop.json')
    );
    this.fs.copy(
      this.templatePath('env/env.release.json'),
      this.destinationPath('app/'+this.props.moduleName.toLowerCase()+'/env/'+this.props.moduleName.toLowerCase()+'-env.release.json')
    );
    this.fs.copy(
      this.templatePath('env/env.master.json'),
      this.destinationPath('app/'+this.props.moduleName.toLowerCase()+'/env/'+this.props.moduleName.toLowerCase()+'-env.master.json')
    );
    this.fs.copy(
      this.templatePath('env/env.tpl.json'),
      this.destinationPath('app/'+this.props.moduleName.toLowerCase()+'/env/'+this.props.moduleName.toLowerCase()+'-env.tpl.json')
    );

    if (this.props.useI18n) {
      this.fs.copy(
        this.templatePath('i18n/resources.json'),
        this.destinationPath('app/'+this.props.moduleName.toLowerCase()+'/i18n/resources_' + (this.props.defaultLang != 'en' ? 'en' : 'pt') + '.json')
      );
    }
  }
});