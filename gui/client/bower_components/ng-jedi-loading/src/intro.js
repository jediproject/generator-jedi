(function (factory) {
    if (typeof define === 'function') {
        define(['angular', 'angular-animate', 'angular-loading-bar', 'ng-jedi-dialogs'], factory);
    } else {
        if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports){
            module.exports = 'jedi.loading';
            require('angular-loading-bar');
        }
        return factory();
    }
}(function() {
	"use strict";
