"use strict";

define(['ng-currency-mask',
        'angular-ngMask',
        'angular-bootstrap',
        'angular-file-upload',
        'ng-jedi-table',
        'app-common-components',
        'angular-toastr'], function () {
    
    angular.module("app.external.components", [ 'ngCurrencyMask',
                                                'ngMask',
                                                'ui.bootstrap',
                                                'angularFileUpload',
                                                'jedi.table',
                                                'toastr' ]);

    angular.module("app.common", ['app.external.components', 'app.common.components']);
    
});