/*
 ng-jedi-dialogs v0.0.1
 Dialogs component written in angularjs
 https://github.com/jediproject/ng-jedi-dialogs
*/
(function (factory) {
    if (typeof define === 'function') {
        define(["angular"], factory);
    } else {
        if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports){
            module.exports = 'jedi.dialogs';
        }
        return factory();
    }
}(function() {
	"use strict";

    angular.module('jedi.dialogs.ctrls', []).controller("jedi.dialogs.AlertCtrl", ["$scope", "$modalInstance", "items", function ($scope, $modalInstance, items) {
        $scope.items = items;
        $scope.ok = function () {
            $modalInstance.close();
        };
    }]).controller("jedi.dialogs.ConfirmCtrl", ["$scope", "$modalInstance", "message", function ($scope, $modalInstance, message, onOk, onCancel) {
        $scope.message = message;
        $scope.ok = function () {
            $modalInstance.close();
        };
    }]);
    angular.module('jedi.dialogs', ['jedi.dialogs.ctrls']);

    angular.module('jedi.dialogs').constant('jedi.dialogs.DialogsConfig', {
        templateUrlAlert: "assets/libs/ng-jedi-dialogs/dialogs-alert.html",
        templateUrlConfirm: "assets/libs/ng-jedi-dialogs/dialogs-confirm.html",
        applyJdi18nToast: true,
        alertTitle: 'Attention!',
        confirmTitle: 'Attention!',
        alertOkLabel: 'Ok',
        confirmYesLabel: 'Yes',
        confirmNoLabel: 'No'
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
                modalConfirmInstance.result.then(function () {
                    modalConfirmInstance = null;
                    if (onOk) {
                        onOk();
                    }
                }, function () {
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
                var i = 0;

                if (arguments.length > 1 && (typeof arguments[1] == 'string' || _.isArray(arguments[1]))) {
                    controller = arguments[1];
                    i++;
                }

                if (arguments.length > 1 + i && (typeof arguments[i + 1] == 'undefined' || typeof arguments[i + 1] == 'object')) {
                    resolve = arguments[i + 1];
                    i++;
                }

                if (arguments.length > 1 + i && (typeof arguments[i + 1] == 'undefined' || typeof arguments[i + 1] == 'function')) {
                    onOk = arguments[i + 1];
                    i++;
                }

                if (arguments.length > 1 + i && (typeof arguments[i + 1] == 'undefined' || typeof arguments[i + 1] == 'function')) {
                    onCancel = arguments[i + 1];
                    i++;
                }

                if (arguments.length > 1 + i) {
                    options = arguments[i + 1];
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
                    // cria controller tempor�rio para expor resolve no scopo
                    _argsCtrl.push(function ($scope) {
                        var _args = arguments;
                        var index = 1;
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
                    options = angular.extend(_options, options);
                } else {
                    options = _options;
                }

                var instance = $modal.open(options);
                instances.push(instance);

                instance.result.then(function () {
                    instances = _.filter(instances, function (item) {
                        return item !== instance;
                    });
                    if (onOk && !(arguments.length == 1 && arguments[0] === DESTROY_EVT)) {
                        onOk.apply(onOk, arguments);
                    }
                }, function () {
                    instances = _.filter(instances, function (item) {
                        return item !== instance;
                    });
                    if (onCancel && !(arguments.length == 1 && arguments[0] === DESTROY_EVT)) {
                        onCancel.apply(onCancel, arguments);
                    }
                });

                return instance;
            },
            closeAll: function () {
                angular.forEach(instances, function (instance) {
                    instance.dismiss(DESTROY_EVT);
                });
            }
        };
    }]).run(['$templateCache', 'jedi.dialogs.DialogsConfig', function ($templateCache, DialogsConfig) {
        if (DialogsConfig.applyJdi18nToast) {
            $templateCache.put('directives/toast/toast.html', "<div class=\"{{toastClass}} {{toastType}}\" ng-click=\"tapToast()\">\n  <div ng-switch on=\"allowHtml\">\n    <div ng-switch-default ng-if=\"title\" class=\"{{titleClass}}\" jd-i18n>{{title}}</div>\n    <div ng-switch-default class=\"{{messageClass}}\" jd-i18n>{{message}}</div>\n    <div ng-switch-when=\"true\" ng-if=\"title\" class=\"{{titleClass}}\" ng-bind-html=\"title\"></div>\n    <div ng-switch-when=\"true\" class=\"{{messageClass}}\" ng-bind-html=\"message\"></div>\n  </div>\n  <progress-bar ng-if=\"progressBar\"></progress-bar>\n</div>\n");
        }

        $templateCache.put('assets/libs/ng-jedi-dialogs/dialogs-alert.html', '<div jd-modal jd-title="'+DialogsConfig.alertTitle+'">'+
                                                                             '    <ul class="alert-message">'+
                                                                             '        <li class="{{ item.type }}" ng-repeat="item in items" jd-i18n>{{ item.message }}</li>'+
                                                                             '    </ul>'+
                                                                             '    <div class="modal-footer">'+
                                                                             '        <button class="btn btn-primary" ng-click="ok()" jd-i18n>'+DialogsConfig.alertOkLabel+'</button>'+
                                                                             '    </div>'+
                                                                             '</div>');

        $templateCache.put('assets/libs/ng-jedi-dialogs/dialogs-confirm.html',  '<div jd-modal jd-title="'+DialogsConfig.confirmTitle+'" jd-hide-close-btn>'+
                                                                                '    <p class="text-info alert-message" jd-i18n>{{message}}</p>'+
                                                                                '    <div class="modal-footer">'+
                                                                                '        <button class="btn btn-primary" ng-click="ok()" jd-i18n>'+DialogsConfig.confirmYesLabel+'</button>'+
                                                                                '        <button class="btn btn-primary" jd-dismiss-modal jd-i18n>'+DialogsConfig.confirmNoLabel+'</button>'+
                                                                                '    </div>'+
                                                                                '</div>');
    }]);

}));