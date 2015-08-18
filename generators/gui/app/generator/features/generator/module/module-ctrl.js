'use strict';

/*
    Controller for the feature module 
*/
jd.factory.newController('app.generator.moduleCtrl', ['$scope', 'jedi.dialogs.AlertHelper', 'envSettings',  'generatorRestService', 'jedi.dialogs.ModalHelper', '$http', '$timeout', '$log',  function ($scope, alertHelper, envSettings, GeneratorRestService, modalHelper, $http, $timeout, $log) {

    //#region Service initialize
     var service = GeneratorRestService.all('module');
    //#endregion

    //#region View/Model initialize
    var vm = this;
    vm.moduleModel = {};
    //#endregion

    vm.moduleModel.languages = [{
        id: 1,
        value: 'pt'
            }, {
        id: 2,
        value: 'en'
            }
        ];
    
    vm.moduleModel.yesno = [{
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
        var params =  vm.moduleModel.params;
        
        service.post(params).then(function(console){
				vm.moduleModel.console = console;
		});
    }
    //#endregion

}]);