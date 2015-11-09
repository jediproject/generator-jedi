'use strict';

/*
    Controller for the feature 
*/
jd.factory.newFilter('maskByType', function() {
	return function (masks, type) {
		if (type == 'boolean') {
			return [];
		}
		return _.filter(masks, function(mask) {
			return !mask.type || mask.type === type;
		});
	}
});