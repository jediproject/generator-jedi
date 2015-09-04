'use strict';

/*
    Controller for the feature 
*/
jd.factory.newController(['app/generator/features/generator/feature/feature-filter.js'], 'app.generator.featureCtrl', ['toastr', 'generatorRestService', '$log', '$filter', function (toastr, GeneratorRestService, $log, $filter) {

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

    vm.featureModel.fieldstype = ['string', 'int', 'dobule', 'boolean', 'date', 'date-time', 'time'];

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
            id: 'multi-radio', // lista de radios, complementado com um key e value
            value: 'Multi-radios'
        },
        {
            id: 'multi-ckeck', // lista de checkboxes, complementado com um key e value
            value: 'Multi-ckecks'
        },
        {
            id: 'multi-select', // lista de options, complementado com um key e value
            value: 'Multi-selects'
        },{
            id: 'multi-radio-rest', // url de get com parametros de entrada e campo para exibição no option
            value: 'Multi-radios by rest'
        },
        {
            id: 'multi-ckeck-rest', // url de get com parametros de entrada e campo para exibição no option
            value: 'Multi-ckecks by rest'
        },
        {
            id: 'multi-select-rest', // url de get com parametros de entrada e campo para exibição no option
            value: 'Multi-selects by rest'
        }, {
            id: 'modal',
            value: 'Modal Directive' // diretiva para abertura de modal, complementado com nome da diretiva, parâmetros de entrada e expressão pra formatar valor
        }
        , {
            id: 'autocomplete', // url para get do autocomplete, parâmetros de entrada, campos de exibição na listagem e expressão pra formatar valor
            value: 'Autocomplete'
        }
        , {
            id: 'password',
            value: 'Password',
            type: 'string'
        }
        , {
            id: 'cpf',
            value: 'Cpf',
            type: 'string'
        }
        , {
            id: 'cnpj',
            value: 'Cnpj',
            type: 'string'
        }
        , {
            id: 'tel',
            value: 'Tel',
            type: 'string'
        }
        , {
            id: 'cep',
            value: 'Cep',
            type: 'string'
        }
        , {
            id: 'url',
            value: 'URL',
            type: 'string'
        }
        , {
            id: 'email',
            value: 'E-mail',
            type: 'string'
        }
        , {
            id: 'pattern',
            value: 'Pattern',
            type: 'string'
        }
        , {
            id: 'currency',
            value: 'Currency',
            type: 'dobule'
        } , {
            id: 'decimal',
            value: 'Decimal',
            type: 'dobule'
        } , {
            id: 'mask',
            value: 'Mask',
            type: 'string'
        }];

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
            value: '1 column'
            }, {
            id: 2,
            value: '2 columns'
            }
        , {
            id: 3,
            value: '3 columns'
            }
        , {
            id: 4,
            value: '4 columns'
            }
        , {
            id: 5,
            value: '5 columns'
            }
        , {
            id: 6,
            value: '6 columns'
            }
        , {
            id: 7,
            value: '7 columns'
            }
        , {
            id: 8,
            value: '8 columns'
            }
        , {
            id: 9,
            value: '9 columns'
            }
        , {
            id: 10,
            value: '10 columns'
            }
        , {
            id: 11,
            value: '11 columns'
            }
        , {
            id: 12,
            value: '12 columns'
            }
        ];

    vm.featureModel.dependsOn = [];

    vm.featureModel.param = {};

    vm.featureModel.param.feature = {};

    vm.featureModel.param.feature.index = 0;

    vm.featureModel.json = {
        destinationRoot: '.'
    }

    vm.featureModel.json.feature = {
        type: 'crud'
    };

    vm.featureModel.json.feature.fields = [];

    //#region Events binds
    vm.generate = generate;
    vm.finished = finished;
    vm.edit = edit;
    vm.remove = remove;
    vm.changeType = changeType;
    vm.hasMasks = hasMasks;
    vm.changeMask = changeMask;
    vm.addMultiItem = addMultiItem;
    //#endregion

    //#region Events definitions
    function finished() {
        //var p = JSON.parse(vm.featureModel.param);
        //var obj = Object.clone(vm.featureModel.param);
        
        var p = JSON.parse(JSON.stringify(vm.featureModel.param.feature));
        vm.featureModel.json.feature.fields.push(p);
        
        var index = vm.featureModel.param.feature.index;
        
        vm.featureModel.param.feature = {};
        vm.featureModel.param.feature.index = index + 1;
    }

    function generate() {
        var params = this;

        params.model = {
            module: service.copy(vm.featureModel.json),
            action: 'new'
        };

        params.model.module.post().then(function (msgConsole) {
            $log.info("MENSAGEM CONSOLE: " + msgConsole);
            vm.featureModel.msgConsole = msgConsole.stderr + msgConsole.stdout + msgConsole.error;
            toastr.success('Feature\'s code generated with success!');
        });
    }

    function edit(item) {
        vm.featureModel.param = JSON.parse(JSON.stringify(item)); 
    }

    function remove(item) {
        vm.featureModel.json.feature.fields.splice(item.index, 1);
    }

    function changeType() {
        if (vm.featureModel.param.feature.userInterface && vm.featureModel.param.feature.userInterface.geral) {
            if (vm.featureModel.param.feature.userInterface.geral.validator) {
                vm.featureModel.param.feature.userInterface.geral.validator.maxCharacter = null;
                vm.featureModel.param.feature.userInterface.geral.validator.minCharacter = null;
                vm.featureModel.param.feature.userInterface.geral.validator.maxRange = null;
                vm.featureModel.param.feature.userInterface.geral.validator.minRange = null;
            }
            vm.featureModel.param.feature.userInterface.geral.fieldMask = null;
            vm.featureModel.param.feature.userInterface.geral.fieldMaskConfig = {};
        }
    }

    function hasMasks() {
        return vm.featureModel.param.feature && vm.featureModel.param.feature.entity && $filter('maskByType')(vm.featureModel.fieldsMask, vm.featureModel.param.feature.entity.fieldType).length > 0;
    }

    function changeMask() {
        if (vm.featureModel.param.feature.userInterface && vm.featureModel.param.feature.userInterface.geral) {
            vm.featureModel.param.feature.userInterface.geral.fieldMaskConfig = {};
            if (vm.featureModel.param.feature.userInterface.geral.fieldMask == 'multi-radio' || vm.featureModel.param.feature.userInterface.geral.fieldMask == 'multi-ckeck' || vm.featureModel.param.feature.userInterface.geral.fieldMask == 'multi-select') {
                vm.featureModel.param.feature.userInterface.geral.fieldMaskConfig.items = [{}];
            }
        }
    }

    function addMultiItem() {
        if (vm.featureModel.param.feature.userInterface && vm.featureModel.param.feature.userInterface.geral) {
            vm.featureModel.param.feature.userInterface.geral.fieldMaskConfig.items.push({});
        }
    }
    //#endregion

}]);