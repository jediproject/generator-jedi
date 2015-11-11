var fs = require("fs");
var exec = require('child_process').exec;
var mkdirp = require('mkdirp');


function puts(error, stdout, stderr) {
    sys.puts(stdout)
}

exports.bootstrap = function (req, res) {
    console.log('body: ' + JSON.stringify(req.body, null, 2));

    var command = 'yo jedi --force ';
    var appName = '--appName="' + req.body.appName + '" ';
    var appTitle = '--appTitle="' + req.body.appTitle + '" ';
    var moduleName = '--moduleName="' + req.body.moduleName + '" ';
    var defaultLang = '--defaultLang="' + req.body.defaultLang + '" ';
    var useI18n = '--useI18n=' + (req.body.useI18n ? true : false) + ' ';
    var useBreadcrumb = '--useBreadcrumb=' + (req.body.useBreadcrumb ? true : false) + ' ';
    var generateAuth = '--generateAuth=' + (req.body.generateAuth ? true : false) + ' ';
    var destinationRoot = '--destinationRoot=' + req.body.destinationRoot + ' ';

    var arguments = appName + appTitle + moduleName + defaultLang + useI18n + useBreadcrumb + generateAuth + destinationRoot;

    console.log(command + arguments);
    execCommand(res, command + arguments);
};

exports.controller = function (req, res) {
    console.log('body: ' + JSON.stringify(req.body, null, 2));

    var command = 'yo jedi:controller --force ';

    var title = '--title="' + req.body.title + '" ';
    var moduleName = '--module="' + req.body.moduleName + '" ';
    var submodule = req.body.submodule ? '--submodule="' + req.body.submodule + '" ' : '';
    var controller = '--controller="' + req.body.controller + '" ';
    var destinationRoot = '--destinationRoot="' + req.body.destinationRoot + '" ';

    var arguments = title + moduleName + submodule + controller + destinationRoot;

    console.log(command + arguments);

    execCommand(res, command + arguments);
};

exports.modal = function (req, res) {
    console.log('body: ' + JSON.stringify(req.body, null, 2));

    var command = 'yo jedi:modal --force ';

    var title = '--title="' + req.body.title + '" ';
    var moduleName = '--module="' + req.body.moduleName + '" ';
    var submodule = req.body.submodule ? '--submodule="' + req.body.submodule + '" ' : '';
    var controller = '--controller="' + req.body.controller + '" ';
    var params = '--params="' + req.body.params + '" ';
    var destinationRoot = '--destinationRoot="' + req.body.destinationRoot + '" ';

    var arguments = title + moduleName + submodule + controller + params + destinationRoot;

    console.log(command + arguments);

    execCommand(res, command + arguments);

};

exports.module = function (req, res) {
    console.log('body: ' + JSON.stringify(req.body, null, 2));

    var command = 'yo jedi:module --force ';

    var moduleName = '--moduleName="' + req.body.moduleName + '" ';
    var defaultLang = '--defaultLang="' + req.body.defaultLang + '" ';
    var useI18n = '--useI18n=' + (req.body.useI18n ? true : false) + ' ';
    var destinationRoot = '--destinationRoot="' + req.body.destinationRoot + '" ';

    var arguments = moduleName + defaultLang + useI18n + destinationRoot;

    console.log(command + arguments);

    execCommand(res, command + arguments);
};

exports.feature = function (req, res) {

    // converte req.body em string
    var myjson = JSON.stringify(req.body, null, 2);

    var obj = JSON.parse(myjson);
    obj.destinationRoot = obj.destinationRoot.replace(/\/?$/, '/');

    var date  = new Date();

    var outputPathname = obj.destinationRoot + 'generate/';
    var outputFilename = outputPathname + obj.featureName + '_' + date.getFullYear() + '-'+  (date.getMonth()+1) + '-'+ date.getDate() +  '-'+ date.getHours() +  '-'+ date.getMinutes()  +  '-'+ date.getSeconds() + '.json';

    mkdirp(outputPathname, function (err) {
        if (err) {
            console.log(err);
            res.send('error: ' + err);
        } else {
            fs.writeFile(outputFilename, myjson, function (err) {
                if (err) {
                    res.send('error: ' + err);
                } else {
                    console.log("JSON saved to " + outputFilename);
                    var command = 'yo jedi:feature --force --loadFromFile=true ';
                    var configFile = '--configFile="' + outputFilename + '"';

                    execCommand(res, command + configFile);
                }
            });
        }
    });
};


exports.commandline = function (req, res) {
    console.log('body: ' + JSON.stringify(req.body, null, 2));
    console.log(req.body.command);
    execCommand(res, req.body.command);
}


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
        res.send(consoleToObj(command, _error, _stdout, _stderr));
    }).stdout.setEncoding('utf8');


};

function consoleToObj(command, error, stdout, stderr) {
    var msgconsole = {};

    msgconsole.command = command; 
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