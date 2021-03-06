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

    app.config(['$routeProvider', '$httpProvider', <% if (props.generateAuth) {%>'jedi.security.SecurityServiceProvider',
        <%} if (props.useRestangular) {%>'RestangularProvider', <%}%>'ngMaskConfig', 'jedi.utilities.UtilitiesProvider'<% if (props.useI18n) {%>, 'jedi.i18n.LocalizeConfig'<%}%><% if (props.defaultLang == 'pt') {%>, 'jedi.dialogs.DialogsConfig', 'jedi.layout.validationtooltip.ValidationTooltipConfig', 'jedi.layout.treeview.TreeviewConfig', 'jedi.utilities.UtilitiesConfig', 'jedi.activities.ActivitiesConfig'<%}%>, function ($routeProvider, $httpProvider, <% if (props.generateAuth) {%>authServiceProvider, <%}%><% if (props.useRestangular) {%>RestangularProvider, <%}%> ngMaskConfig, Utilities<% if (props.useI18n) {%>, LocalizeConfig<%}%><% if (props.defaultLang == 'pt') {%>, DialogsConfig, ValidationTooltipConfig, TreeviewConfig, UtilitiesConfig, ActivitiesConfig<%}%>) {
        var $log = angular.injector(['ng']).get('$log');

        // store local $routeProviderReference to be used during run, if it work with dynamic route mapping
        $routeProviderReference = $routeProvider;

        // configure default alias to the ngMask (cpf, cnpj, tel, etc)
        ngMaskConfig.alias = Utilities.ngMaskDefaultAlias;

        // configure default headers to work with CORS
        Utilities.enableCors($httpProvider);<% if (props.useRestangular) {%>

        // configure Restangular
        Utilities.configureRestangular(RestangularProvider);<% }%><% if (props.defaultLang == 'pt') {%>

        // configure default texts to pt-BR
        TreeviewConfig.emptyMsgLabel = 'Nenhum item encontrado.';

        DialogsConfig.confirmYesLabel = 'Sim';
        DialogsConfig.confirmNoLabel = 'Não';
        DialogsConfig.confirmTitle = 'Atenção!';
        DialogsConfig.alertTitle = 'Atenção!';

        ValidationTooltipConfig.messages = {
            'required': 'Preenchimento obrigatório.',
            'minlength': 'Informe pelo menos {{minLength}} caracteres.',
            'maxlength': 'Informe até {{maxLength}} caracteres.',
            'pattern': 'Valor preenchido é inválido.',
            'equal': 'Valor informado não é igual ao campo anterior.',
            'email': 'Email informado é inválido.',
            'url': 'Url informada é inválida.',
            'number': 'Informe um número válido.',
            'datepicker': 'Informe uma data válida.',
            'date': 'Informe uma data válida.',
            'min': 'Informe um número a partir de {{min}}.',
            'max': 'Informe um número até {{max}}.',
            'cpf': 'CPF informado é inválido.',
            'cnpj': 'CNPJ informado é inválido.',
            'default': 'Conteúdo do campo é inválido.'
        };

        UtilitiesConfig.noLabel = 'Não';
        UtilitiesConfig.yesLabel = 'Sim';

        ActivitiesConfig.inProgressWarning = 'Ao realizar esta ação você perderá {{count}} atividade(s) pendentes.';
        ActivitiesConfig.title = 'Atividades';
        ActivitiesConfig.minimizeLabel = 'Minimizar';
        ActivitiesConfig.closeLabel = 'Fechar';
        ActivitiesConfig.successLabel = 'Concluído';
        ActivitiesConfig.errorLabel = 'Erro';
        ActivitiesConfig.saveLabel = 'Salvar';
        ActivitiesConfig.removeLabel = 'Excluir';<%}%><% if (props.useI18n) {%>

        // configure language
        LocalizeConfig.defaultLanguage = '<%= props.defaultLang%>';<%}%><% if (props.generateAuth) {%>

        // configure authService
        authServiceProvider.config({
            authUrlBase: envSettings.authUrlBase,
            storageKey: 'authData',
            signInUrl: '/auth',
            signOutUrl: '/auth/signout',
            onCreateIdentity: function (response, identity) {
                // complements for a identify
                //identity.name = response.name;
                //identity.email = response.email;
                //identity.cpf = response.cpf;
                return identity;
            }
        });<%}%>
    }]);

    app.run(['$http', '$route', '$rootScope', '$location', 'jedi.dialogs.AlertHelper', '$timeout', '$injector', '$log'<% if (props.useI18n) {%>, 'jedi.i18n.Localize'<%}%>, function ($http, $route, $rootScope, $location, alertHelper, $timeout, $injector, $log<% if (props.useI18n) {%>, localize<%}%>) {
        <% if (props.useI18n) {%>$log.info('Configure i18n');
        localize.addResource('app/common/i18n/resources_{lang}.json');

        <%}%>$log.info('Initializing app context.');

        // store envSettings on rootScope
        $rootScope.envSettings = envSettings;

        // create a app context
        $rootScope.appContext = {
            defaultPageSize: 10
        };

        ////-------<% if (props.generateAuth) {%>

        $log.info('Registry security events');

        function loadUserProfile(ev, identity) {
            // user authenticated
            $rootScope.appContext.identity = identity;

            $log.info('Load modules');

            // load app modules (e.g.: core, billing)
            jd.factory.loadModules(['<%= props.moduleName%>'], <% if (props.useI18n) {%>function (module) {
                // adiciona path para i18n do sistema
                localize.addResource('app/' + module + '/i18n/resources_{lang}.json');
            }, <%}%>function () {
                // after load all modules and its dependencies, it can load routes

                $log.info('Load routes');

                $routeProviderReference
                    //#hook.yeoman.route# do not remove this line
                    .when('/<%= props.moduleName%>/mysubmodule/myfeature1', angularAMD.route({
                        breadcrumb: ['<%= props.moduleName.capitalize()%>', 'My Submodule', 'My Feature 1'],
                        templateUrl: jd.factory.getFileVersion('app/<%= props.moduleName%>/features/mysubmodule/myfeature1/myfeature1.html'),
                        controllerUrl: jd.factory.getFileVersion('app/<%= props.moduleName%>/features/mysubmodule/myfeature1/myfeature1-ctrl.js')
                    })).
                    when('/<%= props.moduleName%>/mysubmodule/myfeature2', angularAMD.route({
                        breadcrumb: ['<%= props.moduleName.capitalize()%>', 'My Submodule', 'My Feature 2'],
                        templateUrl: jd.factory.getFileVersion('app/<%= props.moduleName%>/features/mysubmodule/myfeature2/myfeature2.html'),
                        controllerUrl: jd.factory.getFileVersion('app/<%= props.moduleName%>/features/mysubmodule/myfeature2/myfeature2-ctrl.js')
                    }));
                
                $route.reload();
            });

            if ($location.$$path === '/common/auth/signin' || $location.$$path === '/common/auth/signup') {
                $location.path("/");
            }
        }

        function resetUserProfile(ev, data, status, config, cause) {
            // user unauthenticated
            $routeProviderReference
                .when("/common/auth/signin", angularAMD.route({
                    templateUrl: 'app/common/features/auth/signin/signin.html',
                    controllerUrl: jd.factory.getFileVersion('app/common/features/auth/signin/signin-ctrl.js')
                }))
                .when("/common/auth/signup", angularAMD.route({
                    templateUrl: 'app/common/features/auth/signup/signup.html',
                    controllerUrl: jd.factory.getFileVersion('app/common/features/auth/signup/signup-ctrl.js')
                }));

            $route.reload();

            $location.path('/common/auth/signin');
        }

        // authenticate events
        $rootScope.$on('jedi.security:login-success', loadUserProfile);
        $rootScope.$on('jedi.security:validation-success', loadUserProfile);

        // unauthenticate events
        $rootScope.$on('jedi.security:login-error', resetUserProfile);
        $rootScope.$on('jedi.security:session-expired', resetUserProfile);
        $rootScope.$on('jedi.security:validation-error', resetUserProfile);
        $rootScope.$on('jedi.security:logout-success', resetUserProfile);
        $rootScope.$on('jedi.security:logout-error', resetUserProfile);
        $rootScope.$on('jedi.security:invalid', resetUserProfile);
        ////-------<%} else {%>
        $log.info('Load modules');

        // load app modules (e.g.: core, billing)
        jd.factory.loadModules(['<%= props.moduleName%>'], function (module) {
            <% if (props.useI18n) {%>
                // adiciona path para i18n do sistema
                localize.addResource('app/' + module + '/i18n/resources_{lang}.json');
            <%}%>
        }, function () {
            // after load all modules and its dependencies, it can load routes

            $log.info('Load routes');

            $routeProviderReference
                //#hook.yeoman.route# do not remove this line
                .when('/<%= props.moduleName%>/mysubmodule/myfeature1', angularAMD.route({
                    breadcrumb: ['<%= props.moduleName.capitalize()%>', 'My Submodule', 'My Feature 1'],
                    templateUrl: jd.factory.getFileVersion('app/<%= props.moduleName%>/features/mysubmodule/myfeature1/myfeature1.html'),
                    controllerUrl: jd.factory.getFileVersion('app/<%= props.moduleName%>/features/mysubmodule/myfeature1/myfeature1-ctrl.js')
                })).
                when('/<%= props.moduleName%>/mysubmodule/myfeature2', angularAMD.route({
                    breadcrumb: ['<%= props.moduleName.capitalize()%>', 'My Submodule', 'My Feature 2'],
                    templateUrl: jd.factory.getFileVersion('app/<%= props.moduleName%>/features/mysubmodule/myfeature2/myfeature2.html'),
                    controllerUrl: jd.factory.getFileVersion('app/<%= props.moduleName%>/features/mysubmodule/myfeature2/myfeature2-ctrl.js')
                }));
            
            $route.reload();
        });

        // redirect to home
        $location.path('/');
        <%}%>
    }]);

    // AppCtrl: possui controles gerais da aplicação, como a parte de locale e também de deslogar
    app.controller("app.common.AppCtrl", [<% if (props.useI18n) {%>"jedi.i18n.Localize", <%} if (props.generateAuth) {%>'jedi.security.SecurityService',<%}%> '$log', function (<% if (props.useI18n) {%>localize, <%} if (props.generateAuth) {%>authService, <%}%> $log) {
        $log.info('Iniciando AppCtrl');
        
        var vm = this;<% if (props.useI18n) {%>

        vm.setLanguage = function (language) {
            localize.setLanguage(language);
        };

        vm.getLanguage = function () {
            return localize.getLanguage();
        };<%}%><% if (props.generateAuth) {%>

        vm.signout = function () {
            authService.signOut();
        };<%}%>
    }]);

    return angularAMD.bootstrap(app);
});