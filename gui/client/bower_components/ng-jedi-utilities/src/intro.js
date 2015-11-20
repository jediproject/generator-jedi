(function (factory) {
    if (typeof define === 'function') {
        define(['ng-jedi-dialogs', 'slimscroll', 'angular'], factory);
    } else {
        if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports){
            module.exports = 'jedi.utilities';
        }
        return factory();
    }
}(function() {
	"use strict";
