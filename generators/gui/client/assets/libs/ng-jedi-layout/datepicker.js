'use strict';

define(['moment', 'ng-jedi-utilities', 'angular-ngMask', 'bootstrap-datetimepicker'], function () {

    angular.module('jedi.layout.datepicker', ['jedi.utilities', 'ngMask']).constant('jedi.layout.datepicker.DatepickerConfig', {
        template: '<div class="input-group date">' +
        '	<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>' +
        '</div>',

        mask: function ($element, $attrs, MaskService, ngMaskConfig, $timeout) {
            var _mask = $attrs.mask;
            var _validate;

            var maskService = MaskService.create();
            var timeout;
            var promise;

            function setSelectionRange(selectionStart) {
                if (typeof selectionStart !== 'number') {
                    return;
                }

                // using $timeout:
                // it should run after the DOM has been manipulated by Angular
                // and after the browser renders (which may cause flicker in some cases)
                $timeout.cancel(timeout);
                timeout = $timeout(function () {
                    var selectionEnd = selectionStart + 1;
                    var input = $element[0];

                    if (input.setSelectionRange) {
                        input.focus();
                        input.setSelectionRange(selectionStart, selectionEnd);
                    } else if (input.createTextRange) {
                        var range = input.createTextRange();

                        range.collapse(true);
                        range.moveEnd('character', selectionEnd);
                        range.moveStart('character', selectionStart);
                        range.select();
                    }
                });
            }

            return {
                pre: function ($scope, $element, $attrs, controller) {
                    promise = maskService.generateRegex({
                        mask: $attrs.mask,
                        // repeat mask expression n times
                        repeat: undefined,
                        // clean model value - without divisors
                        clean: false,
                        // limit length based on mask length
                        limit: true,
                        // how to act with a wrong value
                        restrict: 'reject', //select, reject, accept
                        // set validity mask
                        validate: true,
                        // default model value
                        model: $attrs.ngModel,
                        // default input value
                        value: undefined
                    });
                },
                post: function ($scope, $element, $attrs, controller) {
                    promise.then(function () {
                        // get initial options
                        var timeout;
                        var options = maskService.getOptions();

                        function parseViewValue(value) {
                            // set default value equal 0
                            value = value || '';

                            // para o caso do datepicker onde value é um Date e não uma string
                            if (value instanceof Date) {
                                return value;
                            }

                            // get view value object
                            var viewValue = maskService.getViewValue(value);

                            // get mask without question marks
                            var maskWithoutOptionals = options['maskWithoutOptionals'] || '';

                            // get view values capped
                            // used on view
                            var viewValueWithDivisors = viewValue.withDivisors(true);
                            // used on model
                            var viewValueWithoutDivisors = viewValue.withoutDivisors(true);

                            try {
                                // get current regex
                                var regex = maskService.getRegex(viewValueWithDivisors.length - 1);
                                var fullRegex = maskService.getRegex(maskWithoutOptionals.length - 1);

                                // current position is valid
                                var validCurrentPosition = regex.test(viewValueWithDivisors) || fullRegex.test(viewValueWithDivisors);
                                
                                if (!validCurrentPosition) {
                                    viewValue = maskService.removeWrongPositions(viewValueWithDivisors);
                                    viewValueWithDivisors = viewValue.withDivisors(true);
                                    viewValueWithoutDivisors = viewValue.withoutDivisors(true);
                                }
                                viewValueWithDivisors = viewValue.withDivisors(false);
                                viewValueWithoutDivisors = viewValue.withoutDivisors(false);                           
                                // Set validity
                                if (controller.$dirty) {
                                    if (fullRegex.test(viewValueWithDivisors) || controller.$isEmpty(controller.$modelValue)) {
                                        controller.$setValidity('mask', !_validate || _validate(viewValueWithoutDivisors));
                                    } else {
                                        controller.$setValidity('mask', false);
                                    }
                                }
                                // Update view and model values
                                if (value !== viewValueWithDivisors) {
                                    controller.$setViewValue(angular.copy(viewValueWithDivisors), 'input');
                                    controller.$render();
                                }
                            } catch (e) {
                                $log.error('[mask - parseViewValue]');
                                throw e;
                            }
                            return viewValueWithDivisors;
                        }

                        controller.$parsers.push(parseViewValue);

                        $element.on('click input paste keyup', function () {
                            timeout = $timeout(function () {
                                // Manual debounce to prevent multiple execution
                                $timeout.cancel(timeout);
                                parseViewValue($element.val());
                                $scope.$apply();
                            }, 100);
                        });

                        // Register the watch to observe remote loading or promised data
                        // Deregister calling returned function
                        var watcher = $scope.$watch($attrs.ngModel, function (newValue, oldValue) {
                            if (angular.isDefined(newValue)) {
                                parseViewValue(newValue);
                                watcher();
                            }
                        });
                    });
                }
            }
        }
    }).directive('jdDatepicker', ['$compile', '$timeout', 'MaskService', 'ngMaskConfig', 'jedi.utilities.Utilities', '$log', 'jedi.layout.datepicker.DatepickerConfig', function ($compile, $timeout, MaskService, ngMaskConfig, utilities, $log, DatepickerConfig) {
        return {
            restrict: 'A',
            require: '^ngModel',
            compile: function (cElement, cAttrs) {
                if (!cElement.is("input")) {
                    $log.debug('Tentando acionar datepicker num elemento do tipo ' + cElement.prop("nodeName"));
                    return false;
                }

                var datepickerAttr = cAttrs.jdDatepicker;
                var format;
                var options = {
                    showTodayButton: true,
                    showClear: true,
                    showClose: true,
                    useStrict: true,
                    keepInvalid: true,
                    locale: moment.locale()
                };

                if ((datepickerAttr.toLowerCase() == "date-time") || (datepickerAttr.toLowerCase() == "datetime") || (datepickerAttr.toLowerCase() == "date.time")) {
                    options.format = 'L LT';
                    format = moment.localeData(moment.locale()).longDateFormat("L") + " " + moment.localeData().longDateFormat("LT");
                    options.useCurrent = 'minute';
                } else if ((datepickerAttr) == "time") {
                    options.format = 'LT';
                    format = moment.localeData(moment.locale()).longDateFormat("LT");
                    options.useCurrent = 'minute';
                } else if ((datepickerAttr === "") || (datepickerAttr == "date")) {
                    options.format = 'L';
                    format = moment.localeData(moment.locale()).longDateFormat("L");
                    options.useCurrent = 'day';
                } else {
                    format = datepickerAttr;
                    options.format = format;
                    options.useCurrent = 'minute';
                }

                // Para o ng-mask. Campos devem ser obrigatoriamente 'padded' (e.g. 02 ao invés de 2).
                var maskFormat = format.replace(/DD/, '39').replace(/MM/, '19').replace(/YYYY/i, '2999').replace(/yy/i, '99').replace(/hh/i, '29').replace(/mm/, '59').replace(/ss/, '59');

                //placeholder usa o format
                cElement.attr('placeholder', format.toLowerCase());
                cAttrs.placeholder = format.toLowerCase();
                cAttrs.mask = maskFormat;

                var mask = DatepickerConfig.mask(cElement, cAttrs, MaskService, ngMaskConfig, $timeout);

                return {
                    pre: function (scope, element, attrs, ngModel) {
                        mask.pre(scope, element, attrs, ngModel);
                    },
                    post: function (scope, element, attrs, ngModel) {
                        // aplica máscara de data
                        mask.post(scope, element, attrs, ngModel);

                        var dateWrap = utilities.wrapElement(element, DatepickerConfig.template, true);
                        dateWrap.datetimepicker(options);

                        dateWrap.on('dp.change', function (e) {
                            if (!e.date) {
                                ngModel.$setViewValue(null, 'dp.change');
                                return;
                            }

                            var dateValue;
                            if (angular.isDate(e.date) && !isNaN(e.date)) {
                                dateValue = moment(dateValue);
                            } else {
                                dateValue = e.date;
                            }

                            if (moment.isMoment(dateValue) && dateValue.isValid()) {
                                ngModel.$setViewValue(dateValue.format(format), 'dp.change');
                            } else { //prever e tratar outros casos
                                $log.debug("data invalida no datepicker");
                            }
                        });

                        ngModel.$parsers.push(function parseDate(viewValue) {
                            if (!viewValue) {
                                ngModel.$setValidity('datepicker', true);
                                ngModel.$setValidity('mask', true);
                                return viewValue;
                            } else if (moment.isMoment(viewValue) && viewValue.isValid()) {
                                ngModel.$setValidity('datepicker', true);
                                ngModel.$setValidity('mask', true);
                                return viewValue;
                            } else if (angular.isDate(viewValue) && !isNaN(viewValue)) {
                                ngModel.$setValidity('datepicker', true);
                                ngModel.$setValidity('mask', true);
                                return viewValue;
                            } else if (angular.isString(viewValue)) {
                                var date = moment(viewValue, format, true);
                                if (date.isValid()) {
                                    ngModel.$setValidity('datepicker', true);
                                    ngModel.$setValidity('mask', true);
                                    return date.toDate();
                                } else {
                                    ngModel.$setValidity('datepicker', false);
                                    return viewValue;
                                }
                            } else {
                                ngModel.$setValidity('datepicker', false);
                                return viewValue;
                            }
                        });

                        ngModel.$formatters.push(function dateFormatter(value) {
                            if (!value) {
                                return value;
                            } else if (moment.isMoment(value) && value.isValid()) {
                                return value.format(format);
                            } else if (angular.isDate(value) && !isNaN(value)) {
                                var date = moment(value);
                                return date.format(format);
                            } else if (angular.isString(value)) {
                                var date = moment(value, format, true);
                                if (date.isValid()) {
                                    return date.format(format);
                                } else {
                                    //Em alguns casos value é uma string de um objeto Date (date.toString()), e o moment não consegue realizar o parse
                                    date = new Date(value);
                                    var mDate = moment(date);
                                    if (mDate.isValid()) {
                                        return mDate.format(format);
                                    } else {
                                        ngModel.$setValidity('datepicker', false);
                                        return value;
                                    }
                                }
                            } else {
                                return value;
                            }
                        });

                        //Seta min e max date para o Datepicker - possibilita que dois datepickers sejam usados linkados um ao outro
                        if (attrs.jdMinDate) {
                            scope.$watch(attrs.jdMinDate, function (newValue, oldValue) {
                                var dt;

                                if ((scope.$eval(attrs.jdMinDate)) instanceof Date) {
                                    dt = moment(scope.$eval(attrs.jdMinDate));
                                } else {
                                    dt = moment(scope.$eval(attrs.jdMinDate), format, true);
                                }

                                if (dt.isValid()) {
                                    dateWrap.data("DateTimePicker").minDate(dt);
                                } else {
                                    if (dateWrap.data("DateTimePicker").minDate() !== false) {
                                        dateWrap.data("DateTimePicker").minDate(false);
                                    }
                                }
                            });
                        }

                        if (attrs.jdMaxDate) {
                            scope.$watch(attrs.jdMaxDate, function (newValue, oldValue) {
                                var dt;

                                if ((scope.$eval(attrs.jdMaxDate)) instanceof Date) {
                                    dt = moment(scope.$eval(attrs.jdMaxDate));
                                } else {
                                    dt = moment(scope.$eval(attrs.jdMaxDate), format, true);
                                }

                                if (dt.isValid()) {
                                    dateWrap.data("DateTimePicker").maxDate(dt);
                                } else {
                                    if (dateWrap.data("DateTimePicker").maxDate() !== false) {
                                        dateWrap.data("DateTimePicker").maxDate(false);
                                    }
                                }
                            });
                        }

                        //Implementado para prevenir que o datepicker sobreponha o menu. 
                        dateWrap.on('dp.show', function (e) {
                            var widget = $(e.currentTarget).children("div.bootstrap-datetimepicker-widget");
                            var panel = widget.parents('.form-group').parent();
                            if (widget.length > 0 && panel.length > 0) {
                                //Testa se o widget está acima do inicio do painel principal da tela
                                if (widget.offset().top < panel.offset().top) {
                                    widget.removeClass('top');
                                    widget.addClass('bottom');
                                    widget.attr('style', 'display: block; top: 26px; bottom: auto; left: 0px; right: auto;');
                                }
                            }
                        });

                        // destroy
                        // se escopo destruido remove eventos
                        scope.$on('$destroy', function () {
                            if (dateWrap) {
                                var dtPicker = dateWrap.data('DateTimePicker');
                                if (dtPicker) {
                                    dtPicker.destroy();
                                }
                            }
                        });
                        // se input destruido remove wrap
                        element.on('$destroy', function () {
                            if (dateWrap) {
                                var w = dateWrap;
                                dateWrap = null;
                                w.remove();
                            }
                            scope.$destroy();
                        });
                    }
                };
            }
        };
    }]);
});