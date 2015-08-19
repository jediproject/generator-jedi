'use strict';

/*
    Controller for the feature myfeature2
*/
jd.factory.newController('app.poc.mysubmodule.myfeature2.Myfeature2Ctrl', [function () {

    //#region Service initialize
    var service;// = ... e.g: restangular instance
    //#endregion

    //#region View/Model initialize
    var vm = this;
    vm.myfeature2Model = {};
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