'use strict';

/*
    Controller for the feature 
*/
jd.factory.newController('app.generator.featureCtrl', ['$scope', 'jedi.dialogs.AlertHelper', 'envSettings', 'generatorRestService', 'jedi.dialogs.ModalHelper', '$http', '$timeout', '$log', function ($scope, alertHelper, envSettings, GeneratorRestService, modalHelper, $http, $timeout, $log) {

    //#region Service initialize
    var service = GeneratorRestService.all('feature');
    //#endregion

    //#region View/Model initialize
    var vm = this;
    vm.featureModel = {};
    //#endregion


    vm.featureModel.featuresType = [
        {
            id: 'crud',
            value: 'Crud'
        }
        ];

    vm.featureModel.fieldstype = [
        {
            id: 1,
            value: 'string'
            },
        {
            id: 2,
            value: 'int'
            },
        {
            id: 3,
            value: 'dobule'
            },
        {
            id: 4,
            value: 'boolean'
            },
        {
            id: 5,
            value: 'date'
            },
        {
            id: 6,
            value: 'date-time'
            }
        ];

    vm.featureModel.cardinality = [
        {
            id: 1,
            value: 'one-to-one'
            }, {
            id: 2,
            value: 'one-to-many'
            }
        ];

    vm.featureModel.yesNo = [
        {
            id: true,
            value: 'Yes'
            }, {
            id: false,
            value: 'No'
            }
        ];

    vm.featureModel.fieldsMask = [
        {
            id: 'text',
            value: 'Text'
            }, {
            id: 'multi-select',
            value: 'Multi-select'
            }, {
            id: 'single-select',
            value: 'Single-select'
            }
            , {
            id: 'text-multi-value',
            value: 'Text-multi-value'
            }
            , {
            id: 'date',
            value: 'Date'
            }
            , {
            id: 'date-time',
            value: 'Date-time'
            }
            , {
            id: 'password',
            value: 'Password'
            }
            , {
            id: 'cpf',
            value: 'Cpf'
            }
            , {
            id: 'cnpj',
            value: 'Cnpj'
            }
            , {
            id: 'tel',
            value: 'Tel'
            }
            , {
            id: 'cep',
            value: 'Cep'
            }
            , {
            id: 'int',
            value: 'Int'
            }
            , {
            id: 'currency',
            value: 'Currency'
            } , {
            id: 'decimal',
            value: 'Decimal'
            }
            , {
            id: 'boolean',
            value: 'Boolean'
            }
            , {
            id: 'radio-button',
            value: 'Radio-button'
            }
            , {
            id: 'check-box',
            value: 'Check-box'
            }
        ];

    vm.featureModel.fiedlsEditableFor = [
        {
            id: 'insert',
            value: 'Insert'
            }, {
            id: 'update',
            value: 'Update'
            }];

    vm.featureModel.size = [
        {
            id: 1,
            value: 'col-md-1'
            }, {
            id: 2,
            value: 'col-md-2'
            }
        , {
            id: 3,
            value: 'col-md-3'
            }
        , {
            id: 4,
            value: 'col-md-4'
            }
        , {
            id: 5,
            value: 'col-md-5'
            }
        , {
            id: 6,
            value: 'col-md-6'
            }
        , {
            id: 7,
            value: 'col-md-7'
            }
        , {
            id: 8,
            value: 'col-md-8'
            }
        , {
            id: 9,
            value: 'col-md-9'
            }
        , {
            id: 10,
            value: 'col-md-10'
            }
        , {
            id: 11,
            value: 'col-md-11'
            }
        , {
            id: 12,
            value: 'col-md-12'
            }
        ];


    vm.featureModel.dependsOn = [];

    vm.featureModel.param = {};

    vm.featureModel.param.feature = {};

    vm.featureModel.param.feature.index = 0;

    vm.featureModel.json = {}

    vm.featureModel.json.feature = {};

    vm.featureModel.json.feature.fields = [];

    //#region Events binds
    vm.generate = generate;
    
    
    //#endregion

    $scope.finished = function () {
        // var p = JSON.parse(vm.featureModel.param);
        //  var obj = Object.clone(vm.featureModel.param);
        
        var p = JSON.parse(JSON.stringify(vm.featureModel.param.feature));
        vm.featureModel.json.feature.fields.push(p);
        
        var index = vm.featureModel.param.feature.index;
        
        vm.featureModel.param.feature = {};
        vm.featureModel.param.feature.index = index + 1 ;
    }


    //#region Events definitions
    function generate() {
        var params = this;

        params.model = {
            module: service.copy(vm.featureModel.json),
            action: 'new'
        };


        params.model.module.post().then(function (msgConsole) {
            console.log("MENSAGEM CONSOLE: " + msgConsole);
            vm.featureModel.msgConsole = msgConsole.stderr + msgConsole.stdout + msgConsole.error;
            alertHelper.addInfo('Operação realizada com sucesso!');
        });
    }

    $scope.edit = function (item) {
        vm.featureModel.param = JSON.parse(JSON.stringify(item)); 
    }

    $scope.remove =  function (item) {
            vm.featureModel.json.feature.fields.splice(item.index, 1);
    }
        //#endregion


}]);