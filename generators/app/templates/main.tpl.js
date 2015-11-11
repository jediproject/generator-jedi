"use strict";

// added to avoid concat app for all paths started with app
require.jsExtRegExp = /^app\/|^\/|:|\?|\.js$/;

require.config({
    waitSeconds: 15,

    baseUrl: "",

    paths: {
        // ## base
        'app': 'app/app.js',
        'version': 'version.json',

        // ## ng-jedi components
        'ng-jedi-utilities': 'assets/libs/ng-jedi-utilities/utilities.js',<% if (props.useI18n) {%>
        'ng-jedi-i18n': 'assets/libs/ng-jedi-i18n/i18n.js',<%}%>
        'ng-jedi-dialogs': 'assets/libs/ng-jedi-dialogs/dialogs.js',
        'ng-jedi-factory': 'assets/libs/ng-jedi-factory/factory.js',
        'jdver': 'assets/libs/ng-jedi-factory/version.js',
        'ng-jedi-loading': 'assets/libs/ng-jedi-loading/loading.js',<% if (props.useBreadcrumb) {%>
        'ng-jedi-breadcrumb': 'assets/libs/ng-jedi-breadcrumb/breadcrumb.js',<%}%>
        'ng-jedi-layout': 'assets/libs/ng-jedi-layout/layout.js',
        'ng-jedi-table': 'assets/libs/ng-jedi-table/table.js',
        'ng-jedi-activities': 'assets/libs/ng-jedi-activities/activities.js',<% if (props.generateAuth) {%>
        'ng-jedi-security': 'assets/libs/ng-jedi-security/security.js',<%}%>
        'ng-jedi-table': 'assets/libs/ng-jedi-table/table.js',

        // ## common components
        'app-common': 'app/common/common-app.js',
        'app-common-env': 'app/common/env/common-env.json.js',
        'app-common-components': 'app/common/components/components.js',
        'app-common-components-exceptions': 'app/common/components/exceptions/exceptions.js',

        //## 3rd party angular scripts
        'angular': 'assets/libs/angular/angular.js',
        'angular-animate': 'assets/libs/angular-animate/angular-animate.js',<% if (props.generateAuth) {%>
        'cryptojslib': 'assets/libs/cryptojslib/md5.js',<%}%>
        'angular-bootstrap': 'assets/libs/angular-bootstrap/ui-bootstrap-tpls.js',
        'angular-cookie': 'assets/libs/angular-cookie/angular-cookie.js',
        'angular-file-upload': 'assets/libs/angular-file-upload/angular-file-upload.js',<% if (props.useI18n) {%>
        'angular-dynamic-locale': 'assets/libs/angular-dynamic-locale/tmhDynamicLocale.js',<%} else {%>
        'angular-i18n': 'assets/libs/angular-i18n/angular-locale_<%= props.defaultLang%>.js',<%}%>
        'angular-loading-bar': 'assets/libs/angular-loading-bar/loading-bar.js',
        'angular-ngMask': 'assets/libs/angular-ngMask/ngMask.js',
        'angular-route': 'assets/libs/angular-route/angular-route.js',
        'angularAMD': 'assets/libs/angularAMD/angularAMD.js',
        'ng-currency-mask': 'assets/libs/ng-currency-mask/ng-currency-mask.js',<% if (props.useRestangular) {%>
        'restangular': 'assets/libs/restangular/restangular.js',<%}%>
        'angular-toastr': 'assets/libs/angular-toastr/angular-toastr.tpls.js',
        'angular-indexed-db': 'assets/libs/angular-indexed-db/angular-indexed-db.js',

        //## 3rd party non angular scripts
        'bootstrap': 'assets/libs/bootstrap/bootstrap.js',
        'bootstrap-datetimepicker': 'assets/libs/eonasdan-bootstrap-datetimepicker/bootstrap-datetimepicker.js',
        'file-saver-saveas-js': 'assets/libs/file-saver-saveas-js/FileSaver.js',
        'jquery': 'assets/libs/jquery/jquery.js',
        'lodash': 'assets/libs/lodash/lodash.js',
        'moment': 'assets/libs/moment/moment.js',<% if (props.defaultLang != 'en') {%>
        'moment-locale': 'assets/libs/moment/<%= props.defaultLang%>.js',<%}%>
        'slimscroll': 'assets/libs/slimscroll/jquery.slimscroll.js',
        'json': 'assets/libs/requirejs-plugins/json.js',
        'text': 'assets/libs/requirejs-plugins/text.js'
    },

    // Add angular modules that does not support AMD out of the box, put it in a shim
    shim: {
        "moment-locale": ["moment"],
        "jquery": {
            exports: "$"
        },
        "slimscroll": ["jquery"],
        "bootstrap": ["jquery"],
        "bootstrap-datetimepicker": ["bootstrap", <% if (props.defaultLang != 'en') {%>"moment-locale"<%} else {%>"moment"<%}%>],
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
        "angular-toastr": ["angular"],
        "angular-file-upload": ["angular"],<% if (props.useRestangular != 'en') {%>
        "restangular": ["lodash", "angular"],<%}%>
        "angular-loading-bar": ["angular"]<% if (props.useI18n) {%>,
        'angular-dynamic-locale': ["angular"]<%}%>
    },

    // kick start application
    deps: ["app"]
});