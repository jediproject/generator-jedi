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
var _ = require('yeoman-generator/node_modules/lodash')

String.prototype.capitalize = function () {
    return s(this).capitalize().value();
}

String.prototype.decapitalize = function () {
    return s(this).decapitalize().value();
}



module.exports = yeoman.generators.Base.extend({
    prompting: function () {
        var done = this.async();

        // Have Yeoman greet the user.
        this.log(yosay(
            'Welcome to the CI&T Angular Reference Architecture generator to feature!'
        ));

        var prompts = [
            {
                name: 'configFile',
                message: 'Configuration file',
                default: 'config.json'
        }
    ];

        this.prompt(prompts, function (props) {
            this.configFile = props.configFile;
            done();
        }.bind(this));


    },

    writing: function () {
      
        // Load json config from file
        this.config = JSON.parse(fs.readFileSync(path.join(this.configFile), 'utf8'));
        var dest = baseutil.createStructure(this.config.moduleName, this.config.submodule, this.config.featureName);
        
        
      
        
        // Verifica se é para gerar código baseado em crud
        if (this.config.feature.type == 'crud'){
            
            this.writeRoutes();
            this.writeMenu();
            
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
            
        }else{
            console.log('Ops!!! O atributo feature.type não foi definido corretamente no json');
        }
    },
    
    writeMenu: function(){    
        var hook = '<!--#===== yeoman menu hook =====#-->',
            path = 'app/common/components/header/header.html',
            file = require("html-wiring").readFileAsString(path);
        
        var insert = '<li><a href="#/' + this.config.moduleName + '/';
        if (this.config.submodule){
               insert = insert  + this.config.submodule + '/';
        }
        insert = insert + this.config.featureName + '" jd-i18n>' + this.config.featureName + '</a></li>';
        
       if (file.indexOf(hook) != -1) {
            this.write(path, file.replace(hook, insert +  '\n' +  hook ));
        } 
    },
    
    
    writeRoutes: function(){
        var hook = '//#===== yeoman route hook =====#',
            path = 'app/app.js',
            file = require("html-wiring").readFileAsString(path);
        
        
           var insert =   '.when(\'/' + this.config.moduleName +'/';
           if (this.config.submodule){
               insert = insert  + this.config.submodule + '/';
           }
           insert = insert + this.config.featureName + '\', angularAMD.route({ \n';
           insert = insert + 'breadcrumb: [\'' + this.config.moduleName+   '\' , ';
           if (this.config.submodule){
               insert = insert + '\'' + this.config.submodule + '\','; 
           }
           insert = insert + '\'' + this.config.featureName + '\'], \n';
            
           insert = insert + 'templateUrl: jd.factory.getFileVersion(\'app/' + this.config.moduleName + '/features/';
           if (this.config.submodule){
               insert = insert + this.config.submodule + '/';
           }
           insert = insert + this.config.featureName + '/' + this.config.featureName + '.html \'),\n';
            
           insert = insert + 'controllerUrl: jd.factory.getFileVersion(\'app/' + this.config.moduleName + '/features/';
           if (this.config.submodule){
               insert = insert + this.config.submodule + '/';
           }
           insert = insert + this.config.featureName + '/' + this.config.featureName + '-ctrl.js \')\n }))';    
    
        
        

        if (file.indexOf(hook) != -1) {
            this.write(path, file.replace(hook, hook + '\n' + insert));
        }
    }
});