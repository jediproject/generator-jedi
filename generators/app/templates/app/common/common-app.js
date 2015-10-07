"use strict";

define([<% if (!props.useI18n) {%>'angular-i18n',
        <%}%>'ng-currency-mask',
        'angular-ngMask',
        'angular-bootstrap',
        'angular-file-upload',
        'angular-table',
        'app-common-components',
        'angular-toastr'], function () {
    
    angular.module("app.external.components", [ <% if (!props.useI18n) {%>'ngLocale',
                                                <%}%>'ngCurrencyMask',
                                                'ngMask',
                                                'ui.bootstrap',
                                                'angularFileUpload',
                                                'angular-table',
                                                'toastr' ]);

    angular.module("app.common", ['app.external.components', 'app.common.components']);
    
});