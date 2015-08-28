'use strict';

/*
    Controlador da tela de poc.
*/
jd.factory.newController('app.poc.poc.poc.PocCtrl', [ 'jedi.dialogs.AlertHelper', 'pocRestService', 'jedi.dialogs.ModalHelper', '$log', function (alertHelper, pocRestService, modalHelper, $log) {

    //#region Service initialize
    var service = pocRestService.all('');
    //#endregion

    //#region View/Model initialize
    var vm = this;
    vm.pocModel = {};
    //#endregion

    //#region Events binds
    vm.openEditModal = openEditModal;
    vm.openCreateModal = openCreateModal;
    vm.filter = filter;
    vm.remove = remove;
    vm.clear = clear;
    //#endregion

    //#region Load controller
    vm.filter();
    //#endregion
    
    
    //#region Events definitions
    function filter() {
        var _filter = {};
        
              
                if (vm.pocModel.titleFilter && vm.pocModel.titleFilter.trim() != '')                 {
                 _filter.title = vm.pocModel.titleFilter;
                }
             
        
              
                if (vm.pocModel.bodyFilter && vm.pocModel.bodyFilter.trim() != '')                 {
                 _filter.body = vm.pocModel.bodyFilter;
                }
             
        
        

        
        $log.debug('Realizando busca de sistemas com filtros:');
        $log.debug(_filter);

        service.getList(_filter).then(function (data) {
            vm.pocModel.pocs = data;
        });
    }

    function clear() {
        $log.debug('Limpando filtros');

        
              
                  vm.pocModel.titleFilter = null;
             
        
              
                  vm.pocModel.bodyFilter = null;
             
        
                                            
        vm.filter();
    }

    function remove(poc) {
        alertHelper.confirm('Deseja realmente excluir o registro ?', function () {
            $log.debug('Removendo: poc');
             
                 
                     
                        poc.remove({ id: poc.title }).then(function () {
                vm.pocModel.pocs = _.without(vm.pocModel.pocs, poc);             
                              
                 
                     
                        poc.remove({ id: poc.body }).then(function () {
                vm.pocModel.pocs = _.without(vm.pocModel.pocs, poc);             
                              
                 
            
                alertHelper.addInfo('Operação realizada com sucesso!');
            });
        });
    }

    function openEditModal(poc) {
        $log.debug('Abrindo edição do poc: ' + poc);
        $log.debug(poc);

        modalHelper.open('pocEdit.html', ['$scope', '$modalInstance', 'poc', 'action', pocEditCtrl], { poc: poc, action: 'edit' }, function () {
            vm.filter();
        });
    }

    function openCreateModal() {
        $log.debug('Abrindo inclusao de poc');

        modalHelper.open('pocEdit.html', ['$scope', '$modalInstance', 'poc', 'action', pocEditCtrl], { poc: {}, action: 'new' }, function () {
            vm.filter();
        });
    }
    //#endregion

    //#region Subcontrollers definitions
    function pocEditCtrl($scope, $modalInstance, poc, action) {
        //#region View/Model initialize
        var subvm = $scope.pocEditCtrl = {};
        subvm.pocEditModel = {
            poc: service.copy(poc),
            action: action
        };
        //#endregion

        //#region Events binds
        subvm.save = save;
        //#endregion

        //#region Events definitions
        function save() {
            if (!subvm.pocEditModel.poc.id) {
                $log.debug('Salvando inclusão do poc: ');
                $log.debug(subvm.pocEditModel.poc);
                subvm.pocEditModel.poc.post().then(function () {
                    closeAfterSave();
                });
            } else {
                $log.debug('Salvando alterações do poc');
                $log.debug(subvm.pocEditModel.poc);
                subvm.pocEditModel.poc.put().then(function (response) {
                    closeAfterSave();
                });
            }
        }

        function closeAfterSave() {
            subvm.pocEditModel = {};
            $modalInstance.close();
            alertHelper.addInfo('Operação realizada com sucesso!');
        }
        //#endregion
    }
    //#endregion
}]);