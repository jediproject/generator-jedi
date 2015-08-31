"use strict";

define(['ng-currency-mask',
        'angular-ngMask',
        'angular-bootstrap',
        'angular-file-upload',
        'angular-table',
        'app-common-components'], function () {
    
    angular.module("app.external.components", [ 'ngCurrencyMask',
                                                'ngMask',
                                                'ui.bootstrap',
                                                'angularFileUpload',
                                                'angular-table' ]);

    angular.module("app.common", ['app.external.components', 'app.common.components']);
    
});