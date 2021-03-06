'use strict';

/*
    Controller for the feature bootstrap
*/
jd.factory.newController('app.generator.bootstrapCtrl', ['toastr', 'generatorRestService', '$log',  function (toastr, GeneratorRestService, $log) {

    //#region Service initialize
     var service = GeneratorRestService.all('bootstrap');
    //#endregion

    //#region View/Model initialize
    var vm = this;
    vm.bootstrapModel = {
        params: {
            useI18n: false,
            useBreadcrumb: false,
            generateAuth: false,
            destinationRoot: '',
            moduleName: 'core'
        }
    };

    vm.bootstrapModel.commandline = {
        command : ''
    };

    //#endregion
    vm.bootstrapModel.languages = [{
        id: 'pt',
        value: 'pt'
            }, {
        id:'en',
        value: 'en'
            }
        ];
    
    vm.bootstrapModel.yesno = [{
        id: true,
        value: 'yes'
            }, {
        id: false,
        value: 'no'
            }
        ];
    
    //#region Events binds
    vm.generate = generate;
    vm.executeCommand = executeCommand;
    //#endregion

    //#region Events definitions
    function generate() {
        vm.bootstrapModel.msgConsole = '';
        var params =  this;  

        params.model = {
            module : service.copy(vm.bootstrapModel.params),
            action : 'new'
        };

        params.model.module.post().then(function(msgConsole){
            $log.info("MENSAGEM CONSOLE: " + msgConsole);
            vm.bootstrapModel.msgConsole = msgConsole.command + msgConsole.stderr + msgConsole.stdout + msgConsole.error;
            toastr.success('App generated with success!');
        });
    }

    function executeCommand(){
        vm.bootstrapModel.msgConsole = '';
        var service = GeneratorRestService.all('commandline');
        var command = this;

        command.model = {
            module : service.copy(vm.bootstrapModel.commandline),
            action : 'new'
        };

        command.model.module.post().then(function(msgConsole){
            $log.info("MENSAGEM CONSOLE: " + msgConsole);
            vm.bootstrapModel.msgConsole = msgConsole.command + msgConsole.stderr + msgConsole.stdout + msgConsole.error;
            toastr.success('App generated with success!');
        })
    }
    //#endregion

}]);