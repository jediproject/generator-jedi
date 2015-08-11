'use strict';
var mkdirp = require('mkdirp');



module.exports = {
  createStructure: createStructure
};


function createStructure (modulename, submodule, controller) {
  var dest = 'app/' + modulename.toLowerCase() + '/features/';
	if (submodule) {
		dest += submodule.toLowerCase() + '/';
	}
	dest += controller.toLowerCase();
	mkdirp(dest);
    return dest;
}

