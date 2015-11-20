(function (factory) {
    if (typeof define === 'function') {
        define(['moment', 'ng-jedi-utilities', 'angular-ngMask', 'bootstrap-datetimepicker'], factory);
    } else {
        if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports){
            module.exports = 'jedi.layout';
        }
        return factory();
    }
}(function() {
	"use strict";
