'use strict';

/*
    Controlador da tela de complemento do cadastro do usu�rio
*/
factory.newController('app.common.auth.signin.SigninCtrl', ['authService', function (authService) {
    var vm = this;
    vm.signinModel = {};

    vm.signin = function () {
        authService.signIn({
            username: vm.signinModel.username,
            password: vm.signinModel.password
        });
    };
}]);