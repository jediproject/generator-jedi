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
            id: 1,
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
            id: 1,
            value: 'Yes'
            }, {
            id: 2,
            value: 'No'
            }
        ];

    vm.featureModel.fieldsMask = [
        {
            id: 1,
            value: 'text'
            }, {
            id: 2,
            value: 'multi-select'
            }, {
            id: 3,
            value: 'single-select'
            }
            , {
            id: 4,
            value: 'text-multi-value'
            }
            , {
            id: 5,
            value: 'date'
            }
            , {
            id: 6,
            value: 'date-time'
            }
            , {
            id: 7,
            value: 'password'
            }
            , {
            id: 8,
            value: 'cpf'
            }
            , {
            id: 9,
            value: 'tel'
            }
            , {
            id: 10,
            value: 'cep'
            }
            , {
            id: 11,
            value: 'int'
            }
            , {
            id: 12,
            value: 'currency'
            }
            , {
            id: 13,
            value: 'boolean'
            }
            , {
            id: 14,
            value: 'radio-button'
            }
            , {
            id: 15,
            value: 'check-box'
            }
        ];

    vm.featureModel.fiedlsEditableFor = [
        {
            id: 1,
            value: 'Insert'
            }, {
            id: 2,
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

    //#region Events binds
    vm.generate = generate;
    //#endregion


    //#region Events definitions
    function generate() {
            var params = this;

            params.model = {
                module: service.copy(vm.featureModel.params),
                action: 'new'
            };


            params.model.module.post().then(function (msgConsole) {
                console.log("MENSAGEM CONSOLE: " + msgConsole);
                vm.featureModel.msgConsole = msgConsole.stderr + msgConsole.stdout + msgConsole.error;
                alertHelper.addInfo('Operação realizada com sucesso!');
            });
        }
        //#endregion


            }]);