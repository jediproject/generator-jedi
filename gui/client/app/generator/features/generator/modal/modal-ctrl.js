'use strict';

/*
    Controller for the feature modal 
*/
jd.factory.newController('app.generator.modalCtrl', ['toastr', 'generatorRestService', '$log',  function (toastr, GeneratorRestService, $log) {

    //#region Service initialize
     var service = GeneratorRestService.all('modal');
    //#endregion

    //#region View/Model initialize
    var vm = this;
    vm.modalModel = {
        params: {
            destinationRoot: '',
            moduleName : 'core'
        }
    };

     vm.modalModel.commandline = {
        command : ''
    };
    //#endregion

    vm.modalModel.languages = [{
        id: 1,
        value: 'pt'
            }, {
        id: 2,
        value: 'en'
            }
        ];
    
    vm.modalModel.yesno = [{
        id: 1,
        value: 'true'
            }, {
        id: 2,
        value: 'false'
            }
        ];
    
    //#region Events binds
    vm.generate = generate;
    vm.executeCommand = executeCommand;
    //#endregion

    //#region Events definitions
    function generate() {
        vm.modalModel.msgConsole = '';
        var params =  this;  

        params.model = {
            module : service.copy(vm.modalModel.params),
            action : 'new'
        };

        params.model.module.post().then(function(msgConsole){
            $log.info("MENSAGEM CONSOLE: " + msgConsole);
            vm.modalModel.msgConsole = msgConsole.command + msgConsole.stderr + msgConsole.stdout + msgConsole.error;
            toastr.success('Modal\'s code generated with success!');
        });
    }

    function executeCommand(){
        vm.modalModel.msgConsole = '';
        var service = GeneratorRestService.all('commandline');
        var command = this;

        command.model = {
            module : service.copy(vm.modalModel.commandline),
            action : 'new'
        };

        command.model.module.post().then(function(msgConsole){
            $log.info("MENSAGEM CONSOLE: " + msgConsole);
            vm.modalModel.msgConsole = msgConsole.command + msgConsole.stderr + msgConsole.stdout + msgConsole.error;
            toastr.success('App generated with success!');
        })
    }
    //#endregion

}]);