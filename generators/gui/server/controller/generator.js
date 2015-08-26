var fs = require("fs");
var exec = require('child_process').exec;

function puts(error, stdout, stderr) {
    sys.puts(stdout)
}

exports.bootstrap = function (req, res) {
    console.log('body: ' +JSON.stringify(req.body, null, 2));
    
    var command = 'yo jedi --force ';
    var appName = '--appName="' + req.body.appName + '" ';
    var appTitle = '--appTitle="' + req.body.appTitle + '" ';
    var moduleName = '--moduleName="' + req.body.moduleName + '" ';
    var defaultLang = '--defaultLang="' + req.body.defaultLang + '" ';
    var useI18n = '--useI18n=' + (req.body.useI18n? true: false) + ' ';
    var useBreadcrumb = '--useBreadcrumb=' + (req.body.useBreadcrumb? true: false) + ' ';
    var generateAuth = '--generateAuth=' + (req.body.generateAuth? true: false) + ' ';
    var destinationRoot = '--destinationRoot=' + req.body.destinationRoot + ' '; 

    var arguments = appName + appTitle + moduleName + defaultLang + useI18n + useBreadcrumb + generateAuth + destinationRoot;

    console.log(command + arguments);
    execCommand(res, command + arguments);
};

exports.controller = function(req, res){
    console.log('body: ' +JSON.stringify(req.body, null, 2));
    
    var command = 'yo jedi:controller --force ';
    
    var title = '--title="' + req.body.title + '" ';
    var moduleName  = '--module="' + req.body.moduleName + '" ';
    var submodule  = '--submodule="' + req.body.submodule + '" ';
    var controller  = '--controller="' + req.body.controller + '" ';
    var destinationRoot  = '--destinationRoot="' + req.body.destinationRoot + '" ';
    
    var arguments = title + moduleName + submodule + controller + destinationRoot;
    
    console.log(command + arguments);
    
    execCommand(res, command + arguments);
};

exports.modal = function(req, res){
    console.log('body: ' +JSON.stringify(req.body, null, 2));
    
    var command = 'yo jedi:modal --force ';
    
    var title = '--title="' + req.body.title + '" ';
    var moduleName  = '--module="' + req.body.moduleName + '" ';
    var submodule  = '--submodule="' + req.body.submodule + '" ';
    var controller  = '--controller="'+ req.body.controller + '" ';
    var params  = '--params="' +req.body.params + '" ';
    var destinationRoot  = '--destinationRoot="' + req.body.destinationRoot + '" ';
    
    var arguments = title + moduleName + submodule + controller + params+ destinationRoot;
    
    console.log(command + arguments);
    
    execCommand(res, command + arguments);
    
};

exports.module = function(req, res){
    console.log('body: ' +JSON.stringify(req.body, null, 2));
    
    var command = 'yo jedi:module --force ';
    
    var moduleName  = '--moduleName="' + req.body.moduleName + '" '; 
    var defaultLang = '--defaultLang="' + req.body.defaultLang + '" ';
    var useI18n = '--useI18n=' + (req.body.useI18n? true: false) + ' ';
    var destinationRoot  = '--destinationRoot="' + req.body.destinationRoot + '" ';
    
    var arguments = moduleName + defaultLang + useI18n + destinationRoot;
    
    console.log(command + arguments);
    
    execCommand(res, command + arguments);  
};

exports.feature = function(req, res){
    
    var body = JSON.stringify(req.body, null, 2);
    console.log('body: ' +body);
    
    var command = 'yo jedi:feature --force --loadFromFile="n" ';
    var configFile = '--configFile=" ' + body + '" ';
    
    console.log(command + configFile);
    
    execCommand(res, command + configFile);
};


function execCommand(res, command) {

    exec(command, function (error, stdout, stderr) {
        
        var _stdout = stdout;
        var _stderr = stderr;
        var _error = error;
        
        console.log('stdout: ' + _stdout);
        console.log('stderr: ' + _stderr);

        if (_error !== null) {
            console.log('\n exec error: ' + _error);
        }
        res.send( consoleToObj(_error, _stdout, _stderr));
    }).stdout.setEncoding('utf8');
    
    
};

function consoleToObj (error, stdout, stderr){
    var msgconsole = {};
    
    msgconsole.error = error;
    msgconsole.stdout = stdout;
    msgconsole.stderr = stderr;
    
    return msgconsole;
};


function execCommandWithListener(res, command) {
    var child = exec(command);
    child.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
        res.send('stdout: ' + data);

    });
    child.stderr.on('data', function (data) {
        console.log('stdout: ' + data);
        res.send('stdout: ' + data);
    });
    child.on('close', function (code) {
        console.log('closing code: ' + code);
        res.send('closing code: ' + code);
    });
}