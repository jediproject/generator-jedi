/*
 ng-jedi-utilities v0.0.1
 Utilities to make life easier on settings and other needs during development with angularjs
 https://github.com/jediproject/ng-jedi-utilities
*/
(function (factory) {
    if (typeof define === 'function') {
        define(['ng-jedi-dialogs', 'slimscroll', 'angular'], factory);
    } else {
        if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports){
            module.exports = 'jedi.utilities';
        }
        return factory();
    }
}(function() {
	"use strict";

    angular.module("jedi.utilities.directives", []).directive("jdSlimScroll", [function () {
        return {
            restrict: "A",
            link: function (scope, ele, attrs) {
                return ele.slimScroll({
                    height: attrs.scrollHeight || "100%"
                });
            }
        };
    }]).directive("jdValidateEquals", [function () {
        return {
            require: "ngModel",
            link: function (scope, ele, attrs, ngModelCtrl) {
                var me = attrs.ngModel;
                var matchTo = attrs.jdValidateEquals;

                scope.$watch(me, function (value) {
                    if (value) {
                        ngModelCtrl.$setValidity('equal', scope.$eval(me) === scope.$eval(matchTo));
                    } else {
                        ngModelCtrl.$setValidity('equal', true);
                    }
                });

                scope.$watch(matchTo, function (value) {
                    ngModelCtrl.$setValidity('equal', scope.$eval(me) === scope.$eval(matchTo));
                });
            }
        }
    }]).directive("jdFullScreenPage", function () {
        return {
            restrict: "A",
            controller: ["$scope", "$element", "$location", function ($scope, $element, $location) {
                jQuery('body').addClass('body-wide');

                $scope.$watch(function () {
                    return $location.path();
                }, function (newVal, oldVal) {
                    if (newVal !== oldVal) {
                        jQuery('body').removeClass('body-wide');
                    }
                });
            }]
        };
    }).directive('jdDynamicDirective', ['$compile', '$interpolate', function ($compile, $interpolate) {
        return {
            restrict: 'A',
            compile: function (element, attrs) {
                var appDynamicDirective = element.attr('jd-dynamic-directive');
                element.removeAttr('jd-dynamic-directive');
                if (appDynamicDirective) {
                    // remove conteúdo do elemento para aplicar as diretivas e recompilar
                    var children = element.children();
                    element.empty();
                    return {
                        pre: function (scope, element) {
                            // atribui as diretivas novas
                            if (appDynamicDirective.indexOf('{{') > -1) {
                                appDynamicDirective = $interpolate(appDynamicDirective)(scope);
                            }
                            var _attrs = appDynamicDirective.split('|');
                            angular.forEach(_attrs, function (_attr) {
                                var _attr = _attr.split('=');
                                element.attr(_attr[0], _attr.length > 1 ? _attr[1] : '');
                            });
                        },
                        post: function (scope, element) {
                            // adiciona o conteúdo do elemento novamente
                            element.append(children);
                            // recompila
                            $compile(element)(scope);
                        }
                    };
                }
            }
        }
    }]).directive('jdInterpolateFormat', ['$interpolate', function ($interpolate) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                //TODO henriqueb adicionar capacidade de lidar com arrays e etc - improvement
                var appInterpolateFormat = element.attr('jd-interpolate-format');
                ngModel.$formatters.push(function (value) {
                    return $interpolate(appInterpolateFormat)(value);
                });
            }
        };
    }]).directive('jdAsyncValidate', ['$q', function ($q) {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                ctrl.$asyncValidators.jdAsyncValidate = function (modelValue, viewValue) {
                    return $q(function (resolve, reject) {
                        scope.$eval(attrs.jdAsyncValidate)(modelValue, viewValue, resolve, reject);
                    });
                };
            }
        };
    }]).directive('jdEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown.jdEnter keypress.jdEnter", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.jdEnter);
                    });

                    event.preventDefault();
                }
            });

            // destroy
            // se escopo destruido remove eventos
            scope.$on('$destroy', function () {
                element.unbind('keydown.jdEnter keypress.jdEnter');
            });
        };
    }).directive('jdDependsOn', ['$log', function ($log) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.attr("readonly", "true");

                var dependsOn = attrs.jdDependsOn;
                if (dependsOn == "") {
                    $log.error("A diretiva DependsOn precisa de conteúdo válido para funcionar corretamente. Elemento não carregado.")
                    return false;
                }

                var dataListeners = [];
                angular.forEach((dependsOn.split(';')), function (value) {
                    this.push(value.trim());
                }, dataListeners);
                var checkList = {};

                angular.forEach(dataListeners, function (listener) {
                    checkList[listener] = false;

                    scope.$watch(listener, function (newValue, oldValue) {
                        scope.$eval(attrs.ngModel + '=null');
                        if (scope.$eval(listener)) {
                            checkList[listener] = true;
                        } else {
                            checkList[listener] = false;
                        }

                        if (scanCheckList(checkList)) {
                            element.removeAttr("readonly");
                        } else {
                            element.attr("readonly", "true");
                        }
                    });
                });

                function scanCheckList(list) {
                    var flag = true;
                    angular.forEach(list, function (value, key) {
                        if (!value) {
                            flag = false;
                        }
                    });
                    return flag;
                }
            }
        };
    }]).directive("jdSelectSingle", ['$timeout', function ($timeout) {
        return {
            restrict: "A",
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (element.is('select')) {
                    scope.$watch(attrs.jdSelectSingle, function singleSelectWatch(newValue, oldValue) {
                        if (newValue != oldValue && newValue && newValue.length === 1) {
                            $timeout(function () {
                                ngModel.$setViewValue(newValue[0]);
                            }, 300);
                        }
                    });
                }
            }
        }
    }]).directive("jdDisableOn", ['jedi.utilities.Utilities', '$http', function (Utilities, $http) {
        return {
            restrict: "A",
            link: function (scope, element, attrs, ngModel) {
                if (!attrs.jdDisableOn) {
                    attrs.jdDisableOn = 'click';
                }

                function eventFunc() {
                    element[0].disabled = true;
                    element.attr('disabled', true);

                    var isChrome = /chrom(e|ium)/.test(navigator.userAgent.toLowerCase());

                    if (element.is('[type="submit"]') && isChrome) {
                        element.submit();
                    }
                }

                Utilities.bindFirst(element, attrs.jdDisableOn, eventFunc);

                //element.on(attrs.jdDisableOn, function () {
                //    if ($http.pendingRequests.length == 0) {
                //        element.removeAttr('disabled');
                //    }
                //});
            }
        }
    }]);

    angular.module("jedi.utilities.filters", []).filter('jdSelected', function () {
        return function (list, field) {
            if (!field) {
                field = 'selected';
            }
            return _.filter(list, function (item) { return item[field] == true });
        };
    }).filter('jdBoolToText', ['$injector', 'jedi.utilities.UtilitiesConfig', function ($injector, UtilitiesConfig) {
        var localize;
        try {
            localize = $injector.get('jedi.i18n.Localize');
        } catch (e) { }

        var yes = (localize ? localize.get(UtilitiesConfig.yesLabel) : UtilitiesConfig.yesLabel);
        var no = (localize ? localize.get(UtilitiesConfig.noLabel) : UtilitiesConfig.noLabel);

        return function (boolValue) {
            if (boolValue === true)
                return yes;
            else
                return no
        }
    }]).filter('jdTranslate', function () {
        return (function (value) {
            //arguments[0] é ignorado porque é igual ao 'value' recebido pelo parâmetro.
            //Estrutura para entendimento: 
            //-> arguments em uma posição(i) ímpar é o valor que será comparado com o 'value'
            //-> caso seja igual, retorno o texto(string) associado a esse valor, que é arguments[i + 1].
            //Exemplo:
            //arguments[1] == true e arguments[2] == 'Sim'
            for (var i = 1; i < arguments.length; i = i + 2) {
                if (arguments[i] === value) {
                    return arguments[i + 1];
                }
            }
        })
    }).filter('jdCapitalize', function () {
        return function (input) {
            return input.charAt(0).toUpperCase() + input.substr(1);
        }
    }).filter('jdReplaceSpecialChars', function () {
        var specialChars = [
            { val: "a", let: "áàãâä" },
            { val: "e", let: "éèêë" },
            { val: "i", let: "íìîï" },
            { val: "o", let: "óòõôö" },
            { val: "u", let: "úùûü" },
            { val: "c", let: "ç" },
            { val: "A", let: "ÁÀÃÂÄ" },
            { val: "E", let: "ÉÈÊË" },
            { val: "I", let: "ÍÌÎÏ" },
            { val: "O", let: "ÓÒÕÔÖ" },
            { val: "U", let: "ÚÙÛÜ" },
            { val: "C", let: "Ç" },
            { val: "", let: "?!()" }
        ];
        return function (str) {
            var $spaceSymbol = '';
            var regex;
            var returnString = str;
            for (var i = 0; i < specialChars.length; i++) {
                regex = new RegExp("[" + specialChars[i].let + "]", "g");
                returnString = returnString.replace(regex, specialChars[i].val);
                regex = null;
            }
            return returnString.replace(/\s/g, $spaceSymbol);
        }
    });

    angular.module('jedi.utilities', ['jedi.dialogs',
                                      'jedi.utilities.directives',
                                      'jedi.utilities.filters']);

    angular.module('jedi.utilities').constant('jedi.utilities.UtilitiesConfig', {
        yesLabel: 'Yes',
        noLabel: 'No'
    }).provider('jedi.utilities.Utilities', ['$provide', function ($provide) {
        var $log = angular.injector(['ng']).get('$log');
        var $interpolate = angular.injector(['ng']).get('$interpolate');

        var $this = this;

        this.newGuid = function () {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        };

        this.wrapElement = function (element, content, prepend) {
            var wrapper = angular.element(content);
            element.after(wrapper);
            if (prepend) {
                wrapper.prepend(element);
            } else {
                wrapper.append(element);
            }
            return wrapper;
        };

        this.validateCpf = function (strCPF) {
            var add, i, rev;
            strCPF = strCPF.replace(/[^\d]+/g, '');
            if (strCPF === '') return true;
            // Elimina CPFs invalidos conhecidos
            if (strCPF.length != 11 ||
                strCPF == "00000000000" ||
                strCPF == "11111111111" ||
                strCPF == "22222222222" ||
                strCPF == "33333333333" ||
                strCPF == "44444444444" ||
                strCPF == "55555555555" ||
                strCPF == "66666666666" ||
                strCPF == "77777777777" ||
                strCPF == "88888888888" ||
                strCPF == "99999999999")
                return false;
            // Valida 1o digito
            add = 0;
            for (i = 0; i < 9; i++)
                add += parseInt(strCPF.charAt(i)) * (10 - i);
            rev = 11 - (add % 11);
            if (rev == 10 || rev == 11)
                rev = 0;
            if (rev != parseInt(strCPF.charAt(9)))
                return false;
            // Valida 2o digito
            add = 0;
            for (i = 0; i < 10; i++)
                add += parseInt(strCPF.charAt(i)) * (11 - i);
            rev = 11 - (add % 11);
            if (rev == 10 || rev == 11)
                rev = 0;
            if (rev != parseInt(strCPF.charAt(10)))
                return false;
            return true;
        };

        this.validateCnpj = function (strCNPJ) {
            var tamanho, numeros, i, digitos, soma, pos, resultado;
            strCNPJ = strCNPJ.replace(/[^\d]+/g, '');
            if (strCNPJ === '') return true;

            if (strCNPJ.length != 14)
                return false;

            // Elimina CNPJs invalidos conhecidos
            if (strCNPJ == "00000000000000" ||
                strCNPJ == "11111111111111" ||
                strCNPJ == "22222222222222" ||
                strCNPJ == "33333333333333" ||
                strCNPJ == "44444444444444" ||
                strCNPJ == "55555555555555" ||
                strCNPJ == "66666666666666" ||
                strCNPJ == "77777777777777" ||
                strCNPJ == "88888888888888" ||
                strCNPJ == "99999999999999")
                return false;

            // Valida DVs
            tamanho = strCNPJ.length - 2
            numeros = strCNPJ.substring(0, tamanho);
            digitos = strCNPJ.substring(tamanho);
            soma = 0;
            pos = tamanho - 7;
            for (i = tamanho; i >= 1; i--) {
                soma += numeros.charAt(tamanho - i) * pos--;
                if (pos < 2)
                    pos = 9;
            }
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(0))
                return false;

            tamanho = tamanho + 1;
            numeros = strCNPJ.substring(0, tamanho);
            soma = 0;
            pos = tamanho - 7;
            for (i = tamanho; i >= 1; i--) {
                soma += numeros.charAt(tamanho - i) * pos--;
                if (pos < 2)
                    pos = 9;
            }
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(1))
                return false;

            return true;
        };

        this.ngMaskDefaultAlias = {
            'int': function (value) {
                if (typeof value == 'object') {
                    value.repeat = '22';
                }
                return '9?';
            },
            'cpf': {
                mask: '999.999.999-99',
                validate: $this.validateCpf
            },
            'cnpj': {
                mask: '99.999.999/9999-99',
                validate: $this.validateCnpj
            },
            'cep': '99.999-999',
            'tel': function (value) {
                if (typeof value == 'string' && (value.length == 8 || value.length == 9)) {
                    return '9?9999-9999'; //Sem DDD
                }
                return '(99) 9?9999-9999';
            },
            'date': '39/19/2999',
        };

        this.enableCors = function ($httpProvider) {
            $log.info('Configurando headers padrões para habilizar CORS.');

            $httpProvider.defaults.useXDomain = true;
            angular.forEach($httpProvider.defaults.headers, function (header) {
                delete header['X-Requested-With'];
            });
        };

        this.fixIISHttpHeaders = function ($httpProvider) {
            angular.forEach($httpProvider.defaults.headers, function (header) {
                // quando If-Modified-Since é igual a "0" ocorre erro no IIS
                // valor 'Thu, 01 Jan 1970 00:00:00 GMT' corresponde a "0"
                header['If-Modified-Since'] = 'Thu, 01 Jan 1970 00:00:00 GMT';
            });
        };

        this.configureRestangular = function (RestangularProvider) {
            $log.info('Configurando Restangular.');

            RestangularProvider.setRestangularFields({
                id: '_id.$oid'
            });

            RestangularProvider.setRequestInterceptor(function (elem, operation, what) {
                if (operation === 'put') {
                    elem._id = undefined;
                    return elem;
                }
                return elem;
            });

            // adiciona um interceptor para o response de consultas paginadas
            RestangularProvider.addResponseInterceptor(function (data, operation, what, url, response, deferred) {
                var extractedData = {};

                if (typeof data === 'object')
                    extractedData = data;
                else
                    extractedData.result = data;

                if ((operation === "getList" || operation === "post") && data.pageItems && data.totalCount >= 0) {
                    extractedData = data.pageItems;
                    extractedData.totalCount = data.totalCount;
                    extractedData.pageNo = data.pageNo;
                }
                else if (data instanceof ArrayBuffer) {
                    extractedData.data = data;
                    extractedData.headers = response.headers();
                }
                return extractedData;
            });
        };

        this.applyExceptionHandler = function (handler) {
            $log.info('Registrando mecanismo de exception handler javascript.');

            $provide.decorator("$exceptionHandler", ['$delegate', '$injector', function ($delegate, $injector) {
                return function (exception, cause) {
                    $delegate(exception, cause);

                    var message;

                    if (typeof handler == 'function') {
                        message = handler(exception, cause);
                    }

                    if (!message) {
                        if (exception && exception.message && exception.message.indexOf('$injector') > -1) {
                            message = 'Ocorreu algum erro desconhecido durante carregamento da página.';
                        } else
                            if (exception && exception.message && exception.message.indexOf('$compile:tpload')) {
                                // erro já tratado no handler http, trata-se de pagina template não encontrado.
                                return;
                            } else {
                                message = 'Ocorreu algum erro desconhecido de script.';
                            }
                    }

                    try {
                        var alertHelper = $injector.get('jedi.dialogs.AlertHelper');
                        alertHelper.addError(message);
                    } catch (e) {
                        alert(message);
                    }
                };
            }]);
        };

        this.applyModelStateMessages = function (response, defaultMessage) {
            var message;
            if (response && response.modelState) {
                message = [];
                angular.forEach(response.modelState, function (value, key) {
                    var element = jQuery('#' + key.replace('\.', '\\.') + ',[name="' + key.replace('\.', '\\.') + '"]');
                    if (element.length > 0) {
                        element.data('jd-modelstate-errors', value[0]);
                        element.addClass('ng-dirty');
                    } else {
                        message.push({ 'message': value[0], 'type': 'text-danger' });
                    }
                });
                if (message.length == 0) {
                    message = undefined;
                }
            } else {
                message = defaultMessage;
            }
            return message;
        };

        this.bindFirst = function (element, eventName, eventFunc) {
            var events = $._data(element[0], "events");
            if (events && events[eventName]) {
                events = events[eventName].slice(0);
            } else {
                events = [];
            }

            element.unbind(eventName);

            element.on(eventName, eventFunc);

            angular.forEach(events, function (event) {
                element.on(eventName, event.handler);
            });
        };

        this.getLocalStorage = function (id) {
            return JSON.parse(localStorage.getItem(id));
        };

        this.setLocalStorage = function (id, obj) {
            return localStorage.setItem(id, JSON.stringify(obj));
        };

        this.removeLocalStorage = function (id) {
            return localStorage.removeItem(id);
        };

        this.$get = [function () {
            return {
                newGuid: $this.newGuid,

                wrapElement: $this.wrapElement,

                validateCpf: $this.validateCpf,

                validateCnpj: $this.validateCnpj,

                ngMaskDefaultAlias: $this.ngMaskDefaultAlias,

                enableCors: $this.enableCors,

                fixIISHttpHeaders: $this.fixIISHttpHeaders,

                configureRestangular: $this.configureRestangular,

                applyExceptionHandler: $this.applyExceptionHandler,

                applyModelStateMessages: $this.applyModelStateMessages,

                bindFirst: $this.bindFirst,

                getLocalStorage: $this.getLocalStorage,

                setLocalStorage: $this.setLocalStorage,

                removeLocalStorage: $this.removeLocalStorage
            };
        }];

    }]);

    angular.module('jedi.utilities').config(['$httpProvider', function ($httpProvider) {
        // interceptor to apply jd-disable-on after recive response
        $httpProvider.interceptors.push(['$q', function ($q) {
            return {
                response: function (response) {
                    if (response && response.config && response.config.headers && response.config.headers['Content-Type'] && (response.config.headers['Content-Type'].toLowerCase().indexOf('json') >= 0 || response.config.headers['Content-Type'].toLowerCase().indexOf('form') >= 0)) {
                        $('[jd-disable-on]').removeAttr('disabled');
                    }
                    return response || $q.when(response);
                },
                responseError: function (rejection) {
                    if (rejection && rejection.config && rejection.config.headers && rejection.config.headers['Content-Type'] && (rejection.config.headers['Content-Type'].toLowerCase().indexOf('json') >= 0 || rejection.config.headers['Content-Type'].toLowerCase().indexOf('form') >= 0)) {
                        $('[jd-disable-on]').removeAttr('disabled');
                    }
                    return $q.reject(rejection);
                }
            };
        }]);
    }]);

}));