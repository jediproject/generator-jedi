"use strict";

// added to avoid concat app for all paths started with app
require.jsExtRegExp = /^app\/|^\/|:|\?|\.js$/;

require.config({
    baseUrl: "",

    paths: {
        // ## base
        'app': 'app/app',
        'version': 'version.json',

        // ## ng-jedi components
        'ng-jedi-utilities': 'assets/libs/ng-jedi-utilities/utilities',
        'ng-jedi-i18n': 'assets/libs/ng-jedi-i18n/i18n',
        'ng-jedi-dialogs': 'assets/libs/ng-jedi-dialogs/dialogs',
        'ng-jedi-dialogs-ctrls': 'assets/libs/ng-jedi-dialogs/dialogs-ctrls',
        'ng-jedi-factory': 'assets/libs/ng-jedi-factory/factory',
        'jdver': 'assets/libs/ng-jedi-factory/version.js',
        'ng-jedi-loading': 'assets/libs/ng-jedi-loading/loading',
        'ng-jedi-loading-directives': 'assets/libs/ng-jedi-loading/loading-directives',
        'ng-jedi-breadcrumb': 'assets/libs/ng-jedi-breadcrumb/breadcrumb',
        'ng-jedi-layout': 'assets/libs/ng-jedi-layout/layout',
        'ng-jedi-layout-datepicker': 'assets/libs/ng-jedi-layout/datepicker',
        'ng-jedi-layout-input': 'assets/libs/ng-jedi-layout/input',
        'ng-jedi-layout-modal': 'assets/libs/ng-jedi-layout/modal',
        'ng-jedi-layout-panel': 'assets/libs/ng-jedi-layout/panel',
        'ng-jedi-layout-treeview': 'assets/libs/ng-jedi-layout/treeview',
        'ng-jedi-layout-validationtooltip': 'assets/libs/ng-jedi-layout/validationtooltip',
        'ng-jedi-table': 'assets/libs/ng-jedi-table/table',
        'ng-jedi-wizard': 'app/common/components/wizard/wizard-directive',
        'ng-jedi-filemodel': 'app/common/components/ng-jedi-filemodel/ng-jedi-filemodel',

        // ## common components
        'app-common': 'app/common/common-app',
        'app-common-env': 'app/common/env/common-env.json',
        'app-common-components': 'app/common/components/components',
        'app-common-components-exceptions': 'app/common/components/exceptions/exceptions',

        //## 3rd party angular scripts
        'angular': 'assets/libs/angular/angular',
        'angular-animate': 'assets/libs/angular-animate/angular-animate',
        'angular-bootstrap': 'assets/libs/angular-bootstrap/ui-bootstrap-tpls',
        'angular-cookie': 'assets/libs/angular-cookie/angular-cookie',
        'angular-file-upload': 'assets/libs/angular-file-upload-interceptor/angular-file-upload-interceptor',
        'angular-dynamic-locale': 'assets/libs/angular-dynamic-locale/tmhDynamicLocale',
        'angular-loading-bar': 'assets/libs/angular-loading-bar/loading-bar',
        'angular-ngMask': 'assets/libs/angular-ngMask-alias/ngMask',
        'angular-route': 'assets/libs/angular-route/angular-route',
        'angularAMD': 'assets/libs/angularAMD/angularAMD',
        'ng-currency-mask': 'assets/libs/ng-currency-mask/ng-currency-mask',
        'restangular': 'assets/libs/restangular/restangular',
        'angular-toastr': 'assets/libs/angular-toastr/angular-toastr.tpls',

        //## 3rd party non angular scripts
        'bootstrap': 'assets/libs/bootstrap/bootstrap',
        'bootstrap-datetimepicker': 'assets/libs/eonasdan-bootstrap-datetimepicker/bootstrap-datetimepicker',
        'file-saver-saveas-js': 'assets/libs/file-saver-saveas-js/FileSaver',
        'jquery': 'assets/libs/jquery/jquery',
        'lodash': 'assets/libs/lodash/lodash',
        'moment': 'assets/libs/moment/moment',
        'moment-locale': 'assets/libs/moment/pt',
        'slimscroll': 'assets/libs/slimscroll/jquery.slimscroll',
        'json': 'assets/libs/requirejs-plugins/json',
        'text': 'assets/libs/requirejs-plugins/text',
        'jquery-steps' : 'app/common/components/wizard/jquery-steps'
    },

    // Add angular modules that does not support AMD out of the box, put it in a shim
    shim: {
        "moment-locale": ["moment"],
        "jquery": {
            exports: "$"
        },
        "slimscroll": ["jquery"],
        "bootstrap": ["jquery"],
        "bootstrap-datetimepicker": ["bootstrap", "moment-locale"],
        "angular": {
            deps: ["jquery"],
            exports: "angular"
        },
        "angular-route": ["angular"],
        "angular-animate": ["angular"],
        "angular-i18n": ["angular"],
        "angularAMD": ["angular"],
        "angular-bootstrap": ["bootstrap", "angular"],
        "ng-currency-mask": ["angular"],
        "angular-ngMask": ["angular"],
        "angular-file-upload": ["angular"],
        "angular-toastr": ["angular"],
        "restangular": ["lodash", "angular"],
        "angular-loading-bar": ["angular"],
        'angular-dynamic-locale': ["angular"],
        "jquery-steps":["jquery"]
    },

    // kick start application
    deps: ["app"]
});