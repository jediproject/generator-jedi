'use strict';

/*
    Controller for the feature module 
*/
jd.factory.newController('app.generator.moduleCtrl', ['toastr', 'generatorRestService', '$log',  function (toastr, GeneratorRestService, $log) {

    //#region Service initialize
     var service = GeneratorRestService.all('module');
    //#endregion

    //#region View/Model initialize
    var vm = this;
    vm.moduleModel = {
        params: {
            useI18n: false,
            destinationRoot: '',
            moduleName: 'core'
        }
    };

     vm.moduleModel.commandline = {
        command : ''
    };
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
    vm.executeCommand = executeCommand;
    //#endregion

    //#region Events definitions
    function generate() {
        vm.moduleModel.msgConsole = '';
        var params =  this;  

        params.model = {
            module : service.copy(vm.moduleModel.params),
            action : 'new'
        };

        params.model.module.post().then(function(msgConsole){
            $log.info("MENSAGEM CONSOLE: " + msgConsole);
            vm.moduleModel.msgConsole = msgConsole.command + msgConsole.stderr + msgConsole.stdout + msgConsole.error;
            toastr.success('Module generated with success!');
        });
    }


    function executeCommand(){
        vm.moduleModel.msgConsole = '';
        var service = GeneratorRestService.all('commandline');
        var command = this;

        command.model = {
            module : service.copy(vm.moduleModel.commandline),
            action : 'new'
        };

        command.model.module.post().then(function(msgConsole){
            $log.info("MENSAGEM CONSOLE: " + msgConsole);
            vm.moduleModel.msgConsole = msgConsole.command + msgConsole.stderr + msgConsole.stdout + msgConsole.error;
            toastr.success('App generated with success!');
        })
    }
    //#endregion

}]);