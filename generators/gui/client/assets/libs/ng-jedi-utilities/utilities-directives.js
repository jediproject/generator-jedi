"use strict";

define(['slimscroll', 'angular'], function (app) {
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
    }]);
});