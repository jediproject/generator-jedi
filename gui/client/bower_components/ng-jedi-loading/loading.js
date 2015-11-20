/*
 ng-jedi-loading v0.0.1
 Loading component written in angularjs
 https://github.com/jediproject/ng-jedi-loading
*/
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
    }]).run(['$templateCache', function($templateCache) {
        $templateCache.put('assets/libs/ng-jedi-loading/loading.html',  '<div class="modal" id="loadingModal" data-backdrop="static">'+
                                                                        '    <div class="outer">'+
                                                                        '        <div class="inner">'+
                                                                        '            <div class="modal-dialog text-center">'+
                                                                        '                <div class="sk-fading-circle">'+
                                                                        '                    <div class="sk-circle1 sk-circle"></div>'+
                                                                        '                    <div class="sk-circle2 sk-circle"></div>'+
                                                                        '                    <div class="sk-circle3 sk-circle"></div>'+
                                                                        '                    <div class="sk-circle4 sk-circle"></div>'+
                                                                        '                    <div class="sk-circle5 sk-circle"></div>'+
                                                                        '                    <div class="sk-circle6 sk-circle"></div>'+
                                                                        '                    <div class="sk-circle7 sk-circle"></div>'+
                                                                        '                    <div class="sk-circle8 sk-circle"></div>'+
                                                                        '                    <div class="sk-circle9 sk-circle"></div>'+
                                                                        '                    <div class="sk-circle10 sk-circle"></div>'+
                                                                        '                    <div class="sk-circle11 sk-circle"></div>'+
                                                                        '                    <div class="sk-circle12 sk-circle"></div>'+
                                                                        '                </div>'+
                                                                        '            </div>'+
                                                                        '        </div>'+
                                                                        '    </div>'+
                                                                        '</div>');
    }]);
    angular.module('jedi.loading', ['ngAnimate', 'angular-loading-bar', 'jedi.loading.directives', 'jedi.dialogs']).constant('jedi.loading.LoadingConfig', {
        enableInfoAfterResponse: false,
        infoAfterResponseMessage: 'Operação realizada com sucesso.',
        enableLoadingBar: true,
        enableLoadingBlock: false,
    }).factory('jedi.loading.LoadingInterceptor', ['$q', '$injector', '$timeout', 'jedi.loading.LoadingConfig', function($q, $injector, $timeout, LoadingConfig) {
        var alertHelper;
        var loadingModalCounter = 0;
        if (LoadingConfig.enableInfoAfterResponse) {
            alertHelper = $injector.get('jedi.dialogs.AlertHelper');
        }
        return {
            request: function(config) {
                var showLoadingModalDefined = angular.isDefined(config.showLoadingModal) || angular.isDefined(config.headers.showLoadingModal) || (angular.isDefined(config.params) && angular.isDefined(config.params.showLoadingModal));
                var showLoadingModal = config.showLoadingModal || config.headers.showLoadingModal || (config.params && config.params.showLoadingModal);

                if (angular.isUndefined(config.ignoreLoadingBar)) {
                    config.ignoreLoadingBar = !LoadingConfig.enableLoadingBar;
                }

                if ((showLoadingModalDefined && showLoadingModal) || (!showLoadingModalDefined && LoadingConfig.enableLoadingBlock)) {
                    $('#loadingModal').modal('show');
                    loadingModalCounter++;
                    config.openLoadingModal = true;
                }

                return config;
            },
            requestError: function(rejection) {
                if (rejection.config.openLoadingModal) {
                    loadingModalCounter--;
                    if (loadingModalCounter === 0 && $('#loadingModal').hasClass('in')) {
                        $('#loadingModal').modal('hide');
                    }
                }

                return $q.reject(rejection);
            },
            response: function(response) {
                if (response.config.openLoadingModal) {
                    loadingModalCounter--;
                    if (loadingModalCounter === 0 && $('#loadingModal').hasClass('in')) {
                        $('#loadingModal').modal('hide');
                    }
                }

                if (LoadingConfig.enableInfoAfterResponse && (response.headers()['content-type'] && response.headers()['content-type'].toUpperCase().indexOf('JSON') >= 0) && (response.config.method.toUpperCase() !== 'GET')) {
                    alertHelper.addInfo(LoadingConfig.infoAfterResponseMessage);
                }
                return response || $q.when(response);
            },
            responseError: function(rejection) {
                if (rejection.config.openLoadingModal) {
                    loadingModalCounter--;
                    if (loadingModalCounter === 0 && $('#loadingModal').hasClass('in')) {
                        $('#loadingModal').modal('hide');
                    }
                }

                return $q.reject(rejection);
            }
        };
    }]).config(['$httpProvider', function($httpProvider) {
        // configura interceptor para capturar erros de requisição http
        var $log = angular.injector(['ng']).get('$log');
        $log.info('Configure jedi loading.');

        // coloca este interceptor para ser executado primeiro, pra garantir que o loading-bar seja depois e o ignoreLoadingBar funcionar
        $httpProvider.interceptors.unshift('jedi.loading.LoadingInterceptor');
    }]);

}));