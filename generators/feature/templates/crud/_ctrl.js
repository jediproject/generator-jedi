'use strict';

/*
    Controlador da tela de <%= config.featureName%>.
*/
jd.factory.newController('app.<%= config.moduleName.toLowerCase()%>.<%if (config.subModule) {%><%= config.subModule.toLowerCase()%>.<%}%><%= config.featureName.toLowerCase()%>.<%= config.featureName.capitalize()%>Ctrl', [ 'jedi.dialogs.AlertHelper', '<%= config.moduleName%>RestService', 'jedi.dialogs.ModalHelper', '$log', function (alertHelper, <%= config.moduleName%>RestService, modalHelper, $log) {

    //#region Service initialize
    var service = <%= config.moduleName%>RestService.all('<%= config.APIAddress%>');
    //#endregion

    //#region View/Model initialize
    var vm = this;
    vm.<%= config.featureName%>Model = {};
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
        <% config.feature.fields.forEach(function(field){ %>
              <% if (field.userInterface.filter.showInFilter) {%>
                if (vm.<%= config.featureName%>Model.<%= field.entity.fieldName%>Filter && vm.<%= config.featureName%>Model.<%= field.entity.fieldName%>Filter.trim() != '')                 {
                 _filter.<%= field.entity.fieldName%> = vm.<%= config.featureName%>Model.<%= field.entity.fieldName%>Filter;
                }
             <% }%>
        <% }) %>
        

        
        $log.debug('Realizando busca de sistemas com filtros:');
        $log.debug(_filter);

        service.getList(_filter).then(function (data) {
            vm.<%= config.featureName%>Model.<%= config.featureName%>s = data;
        });
    }

    function clear() {
        $log.debug('Limpando filtros');

        <% config.feature.fields.forEach(function(field){ %>
              <% if (field.userInterface.filter.showInFilter) {%>
                  vm.<%= config.featureName%>Model.<%= field.entity.fieldName%>Filter = null;
             <% }%>
        <% }) %>
                                            
        vm.filter();
    }

    function remove(<%= config.featureName%>) {
        alertHelper.confirm('Deseja realmente excluir o registro ?', function () {
            $log.debug('Removendo: <%= config.featureName%>');
            <% if(config.feature.fields)  {%> 
                 <% config.feature.fields.forEach(function(field){ %>
                     <% if (field.userInterface.result.usedToDelete) {%>
                        <%= config.featureName%>.remove({ id: <%= config.featureName%>.<%= field.entity.fieldName%> }).then(function () {
                vm.<%= config.featureName%>Model.<%= config.featureName%>s = _.without(vm.<%= config.featureName%>Model.<%= config.featureName%>s, <%= config.featureName%>);             
                     <% }%>         
                 <% }) %>
            <% }%>
                alertHelper.addInfo('Operação realizada com sucesso!');
            });
        });
    }

    function openEditModal(<%= config.featureName%>) {
        $log.debug('Abrindo edição do <%= config.featureName%>: ' + <%= config.featureName%>);
        $log.debug(<%= config.featureName%>);

        modalHelper.open('<%= config.featureName%>Edit.html', ['$scope', '$modalInstance', '<%= config.featureName%>', 'action', <%= config.featureName%>EditCtrl], { <%= config.featureName%>: <%= config.featureName%>, action: 'edit' }, function () {
            vm.filter();
        });
    }

    function openCreateModal() {
        $log.debug('Abrindo inclusao de <%= config.featureName%>');

        modalHelper.open('<%= config.featureName%>Edit.html', ['$scope', '$modalInstance', '<%= config.featureName%>', 'action', <%= config.featureName%>EditCtrl], { <%= config.featureName%>: {}, action: 'new' }, function () {
            vm.filter();
        });
    }
    //#endregion

    //#region Subcontrollers definitions
    function <%= config.featureName%>EditCtrl($scope, $modalInstance, <%= config.featureName%>, action) {
        //#region View/Model initialize
        var subvm = $scope.<%= config.featureName%>EditCtrl = {};
        subvm.<%= config.featureName%>EditModel = {
            <%= config.featureName%>: service.copy(<%= config.featureName%>),
            action: action
        };
        //#endregion

        //#region Events binds
        subvm.save = save;
        //#endregion

        //#region Events definitions
        function save() {
            if (!subvm.<%= config.featureName%>EditModel.<%= config.featureName%>.id) {
                $log.debug('Salvando inclusão do <%= config.featureName%>: ');
                $log.debug(subvm.<%= config.featureName%>EditModel.<%= config.featureName%>);
                subvm.<%= config.featureName%>EditModel.<%= config.featureName%>.post().then(function () {
                    closeAfterSave();
                });
            } else {
                $log.debug('Salvando alterações do <%= config.featureName%>');
                $log.debug(subvm.<%= config.featureName%>EditModel.<%= config.featureName%>);
                subvm.<%= config.featureName%>EditModel.<%= config.featureName%>.put().then(function (response) {
                    closeAfterSave();
                });
            }
        }

        function closeAfterSave() {
            subvm.<%= config.featureName%>EditModel = {};
            $modalInstance.close();
            alertHelper.addInfo('Operação realizada com sucesso!');
        }
        //#endregion
    }
    //#endregion
}]);