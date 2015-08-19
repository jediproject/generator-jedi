'use strict';

define(['angular'], function () {

    var cancelListenerEvt;

    angular.module('jedi.breadcrumb', []).constant('jedi.breadcrumb.BreadcrumbConfig', {
        homeTitle: 'Principal'
    }).directive("jdBreadcrumb", ['jedi.breadcrumb.BreadcrumbConfig', function (BreadcrumbConfig) {
        return {
            restrict: 'E',
            replace: true,
            link: function (scope, element) {
                // inicializa breadcrumb como página principal
                if (!scope.$root.appContext) {
                    scope.$root.appContext = {};
                }
                if (!scope.$root.appContext.breadcrumb) {
                    scope.$root.appContext.breadcrumb = [BreadcrumbConfig.homeTitle];
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
    }]).run(['$rootScope', '$location', 'jedi.breadcrumb.BreadcrumbConfig', function ($rootScope, $location, BreadcrumbConfig) {
        // atualiza breadcrumb após evento de mudança de rota
        cancelListenerEvt = $rootScope.$on('$routeChangeSuccess', function (ev, next, last) {
            if (next && next.$$route) {
                // atribui breadcrumb da página que a navegação está direcionando
                if (next.$$route.breadcrumb) {
                    if (!$rootScope.appContext) {
                        $rootScope.appContext = {};
                    }
                    $rootScope.appContext.breadcrumb = next.$$route.breadcrumb;
                }

                // limpa querystring após mudança de rota, pra não ficar com lixo na url durante navegação
                // utilizar injeção de $routeParams para obter parametros do querystring
                $location.$$search = {};
            } else {
                $rootScope.appContext.breadcrumb = [BreadcrumbConfig.homeTitle];
            }
        });
    }]);

});