'use strict';

/*
    Controller and modal for the feature subcontroller
*/
jd.factory.newModal('appUndefinedSubpocSubcontroller', 'app/undefined/subpoc/subcontroller/subcontroller.html', 'app.undefined.subpoc.subcontroller.SubcontrollerCtrl', ['yourService', ['params'], function (yourService, params) {

    //#region Service initialize
    var service;// = ... e.g: restangular instance
    //#endregion

    //#region View/Model initialize
    var vm = this;
    vm.subcontrollerModel = {};
    //#endregion

    //#region Events binds
    vm.method1 = method1;
    //#endregion

    //#region Load controller
    method1();
    //#endregion

    //#region Events definitions
    function method1() {
        
    }
    //#endregion

}]);