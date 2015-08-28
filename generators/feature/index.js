'use strict';
var yeoman = require('yeoman-generator');
var util = require('util');
var yosay = require('yosay');
var mkdirp = require('mkdirp');
var chalk = require('chalk');
var path = require('path');
var fs = require('fs');
var s = require("underscore.string");
var baseutil = require('../base-util.js');
var optionOrPrompt = require('yeoman-option-or-prompt');

String.prototype.capitalize = function () {
    return s(this).capitalize().value();
}

String.prototype.decapitalize = function () {
    return s(this).decapitalize().value();
}
module.exports = yeoman.generators.Base.extend({

    _optionOrPrompt: optionOrPrompt,
    prompting: function () {
        var done = this.async();

        // Have Yeoman greet the user.
        this.log(yosay(
            'Welcome to the CI&T Angular Reference Architecture generator to feature!'
        ));

        var prompts = [
            {
                type: 'confirm',
                name: 'loadFromFile',
                message: 'Would you like load json config from file?',
                default: true
            },
            {
                name: 'configFile',
                message: 'Configuration file',
                default: 'config.json'
            }
        ];
            
        this._optionOrPrompt(prompts, function (props) {
            this.props = props;

            // Force to boolean
            this.props.loadFromFile = JSON.parse(this.props.loadFromFile);

            if (this.props.loadFromFile) {
                // Load json config from file
                this.config = JSON.parse(fs.readFileSync(path.join(this.props.configFile), 'utf8'));
            } else {
                var string = decodeURIComponent(this.props.configFile)
                this.config = JSON.parse(string);
            }
            // Froce / in the end. 
            this.config.destinationRoot = this.config.destinationRoot.replace(/\/?$/, '/');

            // set destination root path
            this.destinationRoot(this.props.destinationRoot);
            done();
        }.bind(this));


    },

    writing: function () {

        var dest = baseutil.createStructure(this.config.moduleName, this.config.subModule, this.config.featureName);

        // Verifica se é para gerar código baseado em crud
        if (this.config.feature.type === 'crud') {

            this.fs.copyTpl(
                this.templatePath('crud/_ctrl.js'),
                this.destinationPath(dest + '/' + this.config.featureName + '-ctrl.js'),
                this
            );

            this.fs.copyTpl(
                this.templatePath('crud/_view.html'),
                this.destinationPath(dest + '/' + this.config.featureName + '.html'),
                this
            );

        } else {
            console.log('Ops!!! O atributo feature.type não foi definido corretamente no json');
        }
    },

    writeMenu: function () {

        var hook = '<!--#hook.yeoman.menu# do not remove this line-->';
        var filepath = this.config.destinationRoot + 'app/common/components/header/header.html';
      
        var file = require("html-wiring").readFileAsString(filepath);

        var insert = '<li><a href="#/' + this.config.moduleName + '/';
        if (this.config.subModule) {
            insert = insert + this.config.subModule + '/';
        }
        insert = insert + this.config.featureName + '" jd-i18n>' + this.config.featureName + '</a></li>';

        if (file.indexOf(hook) != -1) {
            this.write(filepath, file.replace(hook, insert + '\n' + hook));
        }
    },


    writeRoutes: function () {
        var hook = '//#hook.yeoman.route# do not remove this line';
        var filepath = this.config.destinationRoot + 'app/app.js';
        var file = require("html-wiring").readFileAsString(filepath);


        var insert = '.when(\'/' + this.config.moduleName + '/';
        if (this.config.subModule) {
            insert = insert + this.config.subModule + '/';
        }
        insert = insert + this.config.featureName + '\', angularAMD.route({ \n';
        insert = insert + 'breadcrumb: [\'' + this.config.moduleName + '\' , ';
        if (this.config.subModule) {
            insert = insert + '\'' + this.config.subModule + '\',';
        }
        insert = insert + '\'' + this.config.featureName + '\'], \n';

        insert = insert + 'templateUrl: jd.factory.getFileVersion(\'app/' + this.config.moduleName + '/features/';
        if (this.config.subModule) {
            insert = insert + this.config.subModule + '/';
        }
        insert = insert + this.config.featureName + '/' + this.config.featureName + '.html \'),\n';

        insert = insert + 'controllerUrl: jd.factory.getFileVersion(\'app/' + this.config.moduleName + '/features/';
        if (this.config.subModule) {
            insert = insert + this.config.subModule + '/';
        }
        insert = insert + this.config.featureName + '/' + this.config.featureName + '-ctrl.js \')\n }))';

        if (file.indexOf(hook) != -1) {
            this.write(filepath, file.replace(hook, hook + '\n' + insert));
        }
    }
});