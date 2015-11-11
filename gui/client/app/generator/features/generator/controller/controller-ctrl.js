'use strict';

/*
    Controller for the feature controller
*/
jd.factory.newController('app.generator.controllerCtrl', ['toastr', 'generatorRestService', '$log',  function (toastr, GeneratorRestService, $log) {

    //#region Service initialize
     var service = GeneratorRestService.all('controller');
    //#endregion

    //#region View/Model initialize
    var vm = this;
    vm.controllerModel = {
        params: {
            destinationRoot: '',
            moduleName : 'core' 
        }
    };

    vm.controllerModel.commandline = {
        command : ''
    };
    //#endregion

    //#region Events binds
    vm.generate = generate;
    vm.executeCommand = executeCommand;
    //#endregion

    //#region Events definitions
    function generate() {
        vm.controllerModel.msgConsole = '';
        var params =  this;  

        params.model = {
            module : service.copy(vm.controllerModel.params),
            action : 'new'
        };

        params.model.module.post().then(function(msgConsole){
            $log.info("MENSAGEM CONSOLE: " + msgConsole);
            vm.controllerModel.msgConsole = msgConsole.command + msgConsole.stderr + msgConsole.stdout + msgConsole.error;
            toastr.success('Controller\'s code generated with success!');
        });
    }

     function executeCommand(){
        vm.controllerModel.msgConsole = '';
        var service = GeneratorRestService.all('commandline');
        var command = this;

        command.model = {
            module : service.copy(vm.controllerModel.commandline),
            action : 'new'
        };

        command.model.module.post().then(function(msgConsole){
            $log.info("MENSAGEM CONSOLE: " + msgConsole);
            vm.controllerModel.msgConsole = msgConsole.command + msgConsole.stderr + msgConsole.stdout + msgConsole.error;
            toastr.success('App generated with success!');
        })
    }
    //#endregion

}]);