'use strict';

/*
    Controller for the feature bootstrap
*/
jd.factory.newController('app.generator.bootstrapCtrl', ['$scope', 'jedi.dialogs.AlertHelper', 'envSettings',  'generatorRestService', 'jedi.dialogs.ModalHelper', '$http', '$timeout', '$log',  function ($scope, alertHelper, envSettings, GeneratorRestService, modalHelper, $http, $timeout, $log) {

    //#region Service initialize
     var service = GeneratorRestService.all('bootstrap');
    //#endregion

    //#region View/Model initialize
    var vm = this;
    vm.bootstrapModel = {};
    //#endregion

    vm.bootstrapModel.languages = [{
        id: 1,
        value: 'pt'
            }, {
        id: 2,
        value: 'en'
            }
        ];
    
    vm.bootstrapModel.yesno = [{
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
        var params =  this;  
        
        params.model = {
           module : service.copy(vm.bootstrapModel.params),
            action : 'new'
        };
    
        
        params.model.module.post().then(function(msgConsole){
                console.log("MENSAGEM CONSOLE: " + msgConsole);
                vm.bootstrapModel.msgConsole = msgConsole.stderr + msgConsole.stdout + msgConsole.error;
                alertHelper.addInfo('Operação realizada com sucesso!');
        });
        
    }
    //#endregion

}]);