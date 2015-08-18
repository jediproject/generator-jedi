'use strict';

/*
    Controller for the feature controller
*/
jd.factory.newController('app.generator.controllerCtrl', ['$scope', 'jedi.dialogs.AlertHelper', 'envSettings',  'generatorRestService', 'jedi.dialogs.ModalHelper', '$http', '$timeout', '$log',  function ($scope, alertHelper, envSettings, GeneratorRestService, modalHelper, $http, $timeout, $log) {

    //#region Service initialize
     var service = GeneratorRestService.all('controller');
    //#endregion

    //#region View/Model initialize
    var vm = this;
    vm.controllerModel = {};
    //#endregion

    vm.controllerModel.languages = [{
        id: 1,
        value: 'pt'
            }, {
        id: 2,
        value: 'en'
            }
        ];
    
    vm.controllerModel.yesno = [{
        id: 1,
        value: 'true'
            }, {
        id: 2,
        value: 'false'
            }
        ];
    

    //#region Events binds
    vm.generate = generate;
    //#endregion


    //#region Events definitions
    function generate() {
        var params =  vm.controllerModel.params;
        
        service.post(params).then(function(console){
				vm.controllerModel.console = console;
		});
    }
    //#endregion

}]);