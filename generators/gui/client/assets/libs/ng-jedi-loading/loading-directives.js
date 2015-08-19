"use strict";

define(['angular'], function (app) {
    angular.module("jedi.loading.directives", []).directive("jdLoading", [function () {
        return {
            restrict: 'E',
            templateUrl: function (elem, attrs) {
                if (attrs.templateUrl) {
                    return attrs.templateUrl;
                } else {
                    return "assets/libs/ng-jedi-loading/loading.html";
                }
            }
        };
    }]);
});