'use strict';

/*
    Controller and modal for the feature <%= props.controller%>
*/
jd.factory.newModal('<%= props.directiveName%>', 'app/<%= props.module.toLowerCase()%>/<%if (props.submodule) {%><%= props.submodule.toLowerCase()%>/<%}%><%= props.controller.toLowerCase()%>/<%= props.controller.toLowerCase()%>.html', 'app.<%= props.module.toLowerCase()%>.<%if (props.submodule) {%><%= props.submodule.toLowerCase()%>.<%}%><%= props.controller.toLowerCase()%>.<%= props.controller.capitalize()%>Ctrl', ['jedi.dialogs.AlertHelper', 'toastr', function (alertHelper, toastr) {

    //#region Service initialize
    var service;// = ... e.g: restangular instance
    //#endregion

    //#region View/Model initialize
    var vm = this;
    vm.<%= props.controller.decapitalize()%>Model = {};
    //#endregion

    //#region Events binds
    vm.method1 = method1;
    vm.method2 = method2;
    //#endregion

    //#region Load controller
    method2();
    //#endregion

    //#region Events definitions
    function method1() {
        alertHelper.addInfo('Method1 called');
    }

    function method2() {
        toastr.success('Method2 called');
    }
    //#endregion

}]);