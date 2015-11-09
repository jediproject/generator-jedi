'use strict';

define([
    //## environment settings
    'json!app-common-env',

    //## Angular modules
    'angularAMD',
    'angular-route',

    //## Commons components
    'app-common',
], function (envSettings, angularAMD) {

    var $routeProviderReference;

    var app = angular.module("app", [
        //## Angular modules
        'ngRoute',

        //## Commons
        'app.common'
    ]);

    // store envSettings as a constant
    app.constant('envSettings', envSettings);

    app.config(['jedi.breadcrumb.BreadcrumbConfig', '$routeProvider', '$httpProvider',  'RestangularProvider', '$provide', 'ngMaskConfig', 'jedi.utilities.UtilitiesProvider', 'jedi.i18n.LocalizeConfig', function (BreadcrumbConfig, $routeProvider, $httpProvider, RestangularProvider, $provide, ngMaskConfig, Utilities, LocalizeConfig) {
        var $log = angular.injector(['ng']).get('$log');

        // store local $routeProviderReference to be used during run, if it work with dynamic route mapping
        $routeProviderReference = $routeProvider;

        // configure default alias to the ngMask (cpf, cnpj, tel, etc)
        ngMaskConfig.alias = Utilities.ngMaskDefaultAlias;

        // configure default headers to work with CORS
        Utilities.enableCors($httpProvider);

        // configure Restangular
        Utilities.configureRestangular(RestangularProvider);

        // configure language
        LocalizeConfig.defaultLanguage = 'en';
        BreadcrumbConfig.homeTitle = 'Home';
    }]);

    app.run(['$http', '$route', '$rootScope', '$location', 'jedi.dialogs.AlertHelper', '$timeout', '$injector', '$log', 'jedi.i18n.Localize', function ($http, $route, $rootScope, $location, alertHelper, $timeout, $injector, $log, localize) {
        $log.info('Configure i18n');
        localize.addResource('app/common/i18n/resources_{lang}.json');

        $log.info('Initializing app context.');

        // store envSettings on rootScope
        $rootScope.envSettings = envSettings;

        // create a app context
        $rootScope.appContext = {
            defaultPageSize: 10
        };

        ////-------
        $log.info('Load modules');

        // load app modules (e.g.: core, billing)
        jd.factory.loadModules(['generator'], function (module) {
            // adiciona path para i18n do sistema
            localize.addResource('app/' + module + '/i18n/resources_{lang}.json');
        }, function () {
            // after load all modules and its dependencies, it can load routes

            $log.info('Load routes');

            $routeProviderReference
                .when('/generator/bootstrap', angularAMD.route({
                    breadcrumb: ['Bootstrap'],
                    templateUrl: jd.factory.getFileVersion('app/generator/features/generator/bootstrap/bootstrap.html'),
                    controllerUrl: jd.factory.getFileVersion('app/generator/features/generator/bootstrap/bootstrap-ctrl.js')
                }))
                .when('/generator/controller', angularAMD.route({
                    breadcrumb: ['AngularJs', 'Controller'],
                    templateUrl: jd.factory.getFileVersion('app/generator/features/generator/controller/controller.html'),
                    controllerUrl: jd.factory.getFileVersion('app/generator/features/generator/controller/controller-ctrl.js')
                }))
                .when('/generator/feature', angularAMD.route({
                    breadcrumb: ['AngularJs', 'Feature'],
                    templateUrl: jd.factory.getFileVersion('app/generator/features/generator/feature/feature.html'),
                    controllerUrl: jd.factory.getFileVersion('app/generator/features/generator/feature/feature-ctrl.js')
                }))
                .when('/generator/modal', angularAMD.route({
                    breadcrumb: ['AngularJs', 'Modal'],
                    templateUrl: jd.factory.getFileVersion('app/generator/features/generator/modal/modal.html'),
                    controllerUrl: jd.factory.getFileVersion('app/generator/features/generator/modal/modal-ctrl.js')
                }))
                .when('/generator/module', angularAMD.route({
                    breadcrumb: ['AngularJs', 'Module'],
                    templateUrl: jd.factory.getFileVersion('app/generator/features/generator/module/module.html'),
                    controllerUrl: jd.factory.getFileVersion('app/generator/features/generator/module/module-ctrl.js')
                }));


            $route.reload();
        });
    }]);

    // AppCtrl: possui controles gerais da aplicação, como a parte de locale e também de deslogar
    app.controller("app.common.AppCtrl", ["jedi.i18n.Localize", function (localize) {
        var vm = this;

        vm.setLanguage = function (language) {
            localize.setLanguage(language);
        };

        vm.getLanguage = function () {
            return localize.getLanguage();
        };
    }]);

    return angularAMD.bootstrap(app);
});