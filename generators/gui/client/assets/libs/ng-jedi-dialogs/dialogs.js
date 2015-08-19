'use strict';

define(['ng-jedi-dialogs-ctrls'], function () {

    angular.module('jedi.dialogs', ['jedi.dialogs.ctrls']);

    angular.module('jedi.dialogs').constant('jedi.dialogs.DialogsConfig', {
        templateUrlAlert: "assets/libs/ng-jedi-dialogs/dialogs-alert.html",
        templateUrlConfirm: "assets/libs/ng-jedi-dialogs/dialogs-confirm.html"
    }).factory('jedi.dialogs.AlertHelper', ['$injector', 'jedi.dialogs.DialogsConfig', function ($injector, DialogsConfig) {
        var $modal = $injector.get('$modal');
        var modalMessages = [];
        var modalMessagesInstance;
        var modalConfirmInstance;

        function showMessages(messages) {

            if (modalMessages.length == 0) {
                modalMessagesInstance = $modal.open({
                    templateUrl: DialogsConfig.templateUrlAlert,
                    controller: "jedi.dialogs.AlertCtrl",
                    windowClass: 'alert-modal-window',
                    resolve: {
                        items: function () {
                            return modalMessages;
                        }
                    }
                });
                modalMessagesInstance.result.then(cleanMessages, cleanMessages);
            };

            angular.forEach(messages, function (newItem, newItemIndex) {
                var exists = false;

                angular.forEach(modalMessages, function (modalItem, modalItemIndex) {
                    if (newItem.message == modalItem.message) {
                        exists = true
                        return;
                    };
                });

                if (!exists)
                    modalMessages.push(newItem);
            });
        };

        function cleanMessages() {
            modalMessages = [];
            modalMessagesInstance = null;
        };

        return {
            confirm: function (message, onOk, onCancel) {
                modalConfirmInstance = $modal.open({
                    templateUrl: DialogsConfig.templateUrlConfirm,
                    controller: "jedi.dialogs.ConfirmCtrl",
                    backdrop: 'static',
                    keyboard: false,
                    windowClass: 'alert-modal-window',
                    resolve: {
                        'message': function () {
                            return message;
                        },
                        'onOk': function () {
                            return onOk;
                        },
                        'onCancel': function () {
                            return onCancel;
                        }
                    }
                });
                modalConfirmInstance.result.then(function() {
                    modalConfirmInstance = null;
                    if (onOk) {
                        onOk();
                    }
                }, function() {
                    modalConfirmInstance = null;
                    if (onCancel) {
                        onCancel();
                    }
                });
            },
            addMessages: function (messages, type) {
                var _messages = [];
                if (angular.isArray(messages)) {
                    angular.forEach(messages, function (value) {
                        _messages.push({ 'message': value, 'type': type });
                    });
                } else {
                    _messages.push({ 'message': messages, 'type': type });
                }
                showMessages(_messages);
            },
            addInfo: function (message) {
                if (typeof message == 'string') {
                    this.addMessages(message, 'text-info');
                } else {
                    showMessages(message);
                }
            },
            addError: function (message) {
                if (typeof message == 'string') {
                    this.addMessages(message, 'text-danger');
                } else {
                    showMessages(message);
                }
            },
            addWarn: function (message) {
                if (typeof message == 'string') {
                    this.addMessages(message, 'text-dangerwarning');
                } else {
                    showMessages(message);
                }
            },
            close: function () {
                if (modalMessagesInstance) {
                    modalMessagesInstance.close();
                }
                if (modalConfirmInstance) {
                    modalConfirmInstance.close();
                }
            }
        };
    }]).factory('jedi.dialogs.ModalHelper', ['$injector', '$log', function ($injector, $log) {
        var $modal = $injector.get('$modal');
        var instances = [];
        var DESTROY_EVT = 'destroy';

        return {
            open: function (templateUrl) {
                var controller, resolve, onOk, onCancel, options;
                var i=0;
                
                if (arguments.length > 1 && (typeof arguments[1] == 'string' || _.isArray(arguments[1]))) {
                    controller = arguments[1];
                    i++;
                }
                
                if (arguments.length > 1+i && (typeof arguments[i+1] == 'undefined' || typeof arguments[i+1] == 'object')) {
                    resolve = arguments[i+1];
                    i++;
                }
                
                if (arguments.length > 1+i && (typeof arguments[i+1] == 'undefined' || typeof arguments[i+1] == 'function')) {
                    onOk = arguments[i+1];
                    i++;
                }
                
                if (arguments.length > 1+i && (typeof arguments[i+1] == 'undefined' || typeof arguments[i+1] == 'function')) {
                    onCancel = arguments[i+1];
                    i++;
                }
                
                if (arguments.length > 1+i) {
                    options = arguments[i+1];
                }
                
                var _argsCtrl = ['$scope'];
                var _resolver = {};
                angular.forEach(resolve, function (value, key) {
                    _argsCtrl.push(key);
                    if (typeof value !== 'function') {
                        _resolver[key] = function () {
                            return value;
                        };
                    } else {
                        _resolver[key] = value;
                    }
                });

                if (!controller && resolve) {
                    // cria controller temporário para expor resolve no scopo
                    _argsCtrl.push(function ($scope) {
                        var _args = arguments;
                        var index=1;
                        angular.forEach(resolve, function (value, key) {
                            $scope[key] = _args[index];
                            index++;
                        });
                    });
                    controller = _argsCtrl;
                }

                var controllerAs = controller && !_.isArray(controller) ? controller.split(/[. ]+/).pop() : undefined;
                if (controllerAs) {
                    controllerAs = controllerAs.charAt(0).toLowerCase() + controllerAs.slice(1);
                }

                var _options = {
                    'templateUrl': templateUrl,
                    'controller': controller,
                    'controllerAs': controllerAs,
                    'backdrop': 'static',
                    'resolve': _resolver
                };

                if (options) {
                    options = angular.extend(options, _options);
                } else {
                    options = _options;
                }

                var instance = $modal.open(options);
                instances.push(instance);

                instance.result.then(function() {
                    instances = _.filter(instances, function(item) {
                        return item !== instance;
                    });
                    if (onOk && !(arguments.length == 1 && arguments[0] === DESTROY_EVT)) {
                        onOk.apply(onOk, arguments);
                    }
                }, function() {
                    instances = _.filter(instances, function(item) {
                        return item !== instance;
                    });
                    if (onCancel && !(arguments.length == 1 && arguments[0] === DESTROY_EVT)) {
                        onCancel.apply(onCancel, arguments);
                    }
                });

                return instance;
            },
            closeAll: function() {
                angular.forEach(instances, function(instance) {
                    instance.dismiss(DESTROY_EVT);
                });
            }
        };
    }]);

});