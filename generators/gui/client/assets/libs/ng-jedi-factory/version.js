'use strict';

define(['ng-jedi-factory'], function (factory) {
	// requirejs plugin to load versioned script
	return {
		//example: ver!url
		load: function (name, req, onLoad) {
		    req(jd.factory.getFileVersion(name), function () {
		        onLoad(mod);
		    });
		}
	};
});