'use strict';
var mkdirp = require('mkdirp');
var beautifyJs = require('js-beautify').js_beautify;
var beautifyHtml = require('js-beautify').html;
var fs = require('fs');

module.exports = {
    createStructure: createStructure,
    identJs: identJs,
    identHtml: identHtml
};

function createStructure(modulename, submodule, controller) {
    var dest = 'app/' + modulename.toLowerCase() + '/features/';
    if (submodule) {
        dest += submodule.toLowerCase() + '/';
    }
    dest += controller.toLowerCase();
    mkdirp(dest);
    return dest;
}

function ident(fileName, beautify, lines) {
	fs.readFile(fileName, 'utf8', function (err, data) {
	    if (err) {
	        throw err;
	    }
	    var newData = beautify(data, { max_preserve_newlines: lines });
		fs.writeFile(fileName, newData);
	});
}

function identJs(fileName) {
	ident(fileName, beautifyJs, 2);
}

function identHtml(fileName) {
	ident(fileName, beautifyHtml, 0);
}