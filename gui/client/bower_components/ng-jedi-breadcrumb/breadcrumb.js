'use strict';

(function (factory) {
    if (typeof define === 'function') {
        define(["angular"], factory);
    } else {
        if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports){
            module.exports = 'jedi.breadcrumb';
        }
        return factory();
    }
}(function() {

    var cancelListenerEvt;

    angular.module('jedi.breadcrumb', []).constant('jedi.breadcrumb.BreadcrumbConfig', {
        homeTitle: 'Home'
    }).directive("jdBreadcrumb", ['jedi.breadcrumb.BreadcrumbConfig', function (BreadcrumbConfig) {
        return {
            restrict: 'E',
            replace: true,
            link: function (scope, element) {
                // inicializa breadcrumb como página principal
                if (!scope.$root.jdBreadcrumb) {
                    scope.$root.jdBreadcrumb = [BreadcrumbConfig.homeTitle];
                }

                scope.$on('$destroy', function () {
                    if (cancelListenerEvt) {
                        cancelListenerEvt();
                        cancelListenerEvt = null;
                    }
                });
                element.on('$destroy', function () {
                    if (cancelListenerEvt) {
                        cancelListenerEvt();
                        cancelListenerEvt = null;
                    }
                });
            },
            templateUrl: function (elem, attrs) {
                if (attrs.templateUrl) {
                    return attrs.templateUrl;
                } else {
                    return "assets/libs/ng-jedi-breadcrumb/breadcrumb.html";
                }
            }
        };
    }]).run(['$rootScope', '$location', 'jedi.breadcrumb.BreadcrumbConfig', '$templateCache', function ($rootScope, $location, BreadcrumbConfig, $templateCache) {
        // atualiza breadcrumb após evento de mudança de rota
        cancelListenerEvt = $rootScope.$on('$routeChangeSuccess', function (ev, next, last) {
            if (next && next.$$route) {
                // atribui breadcrumb da página que a navegação está direcionando
                if (next.$$route.breadcrumb) {
                    $rootScope.jdBreadcrumb = next.$$route.breadcrumb;
                }

                // limpa querystring após mudança de rota, pra não ficar com lixo na url durante navegação
                // utilizar injeção de $routeParams para obter parametros do querystring
                $location.$$search = {};
            } else {
                $rootScope.jdBreadcrumb = [BreadcrumbConfig.homeTitle];
            }
        });

        // template
        $templateCache.put('assets/libs/ng-jedi-breadcrumb/breadcrumb.html', '<ol class="breadcrumb hidden-xs">'+
                                                                             '    <li class="active" ng-repeat="item in jdBreadcrumb track by $index + item" jd-i18n>{{item}}</li>'+
                                                                             '</ol>');
    }]);

}));