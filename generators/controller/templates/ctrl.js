'use strict';

/*
    Controller for the feature <%= props.controller%>
*/
jd.factory.newController('app.<%= props.module.toLowerCase()%>.<%if (props.submodule) {%><%= props.submodule.toLowerCase()%>.<%}%><%= props.controller.toLowerCase()%>.<%= props.controller.capitalize()%>Ctrl', [function () {

    //#region Service initialize
    var service;// = ... e.g: restangular instance
    //#endregion

    //#region View/Model initialize
    var vm = this;
    vm.<%= props.controller.decapitalize()%>Model = {};
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