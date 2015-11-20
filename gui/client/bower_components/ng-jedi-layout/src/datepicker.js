    angular.module('jedi.layout.datepicker', ['jedi.utilities', 'ngMask']).constant('jedi.layout.datepicker.DatepickerConfig', {
        template: '<div class="input-group date">' +
        '   <span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>' +
        '</div>',

        mask: function ($scope, $element, $attrs, MaskService, ngMaskConfig, $timeout, controller) {
            var _mask = $attrs.mask;
            var maskService = MaskService.create();
            var promise;

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

                        // Set validity
                        if (controller.$dirty) {
                            if (fullRegex.test(viewValueWithDivisors) || controller.$isEmpty(controller.$modelValue)) {
                                controller.$setValidity('mask', true);
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
                var containParser = false;
                angular.forEach(controller.$parsers, function (parser) {
                    if (parser == parseViewValue.toString()) {
                        containParser = true;
                    }
                });

                if (!containParser) {
                    controller.$parsers.push(parseViewValue);
                }

                var inputHandler = function () {
                    timeout = $timeout(function () {
                        // Manual debounce to prevent multiple execution
                        $timeout.cancel(timeout);
                        parseViewValue($element.val());
                        $scope.$apply();
                    }, 100);
                };

                $element.on('click.dtMask input.dtMask paste.dtMask keyup.dtMask', inputHandler);

                // Register the watch to observe remote loading or promised data
                // Deregister calling returned function
                var watcher = $scope.$watch($attrs.ngModel, function (newValue, oldValue) {
                    if (angular.isDefined(newValue)) {
                        parseViewValue(newValue);
                        watcher();
                    }
                });
            });

            return function () {
                $element.off('.dtMask');
                _mask = null;
                maskService = null;
            };
        }
    }).directive('jdDatepicker', ['$compile', '$timeout', 'MaskService', 'ngMaskConfig', 'jedi.utilities.Utilities', '$log', 'jedi.layout.datepicker.DatepickerConfig', function ($compile, $timeout, MaskService, ngMaskConfig, utilities, $log, DatepickerConfig) {
        return {
            restrict: 'A',
            require: '^ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (!element.is("input")) {
                    return false;
                }

                var datepickerAttr = attrs.jdDatepicker;
                var options = {
                    showTodayButton: true,
                    showClear: true,
                    showClose: true,
                    useStrict: true,
                    keepInvalid: true
                };
                var format;
                var maskFormat;
                var mask;
                var dateWrap;

                //Cria o input-group em volta do input
                dateWrap = utilities.wrapElement(element, DatepickerConfig.template, true);

                var setupDp = function setupDp() {
                    //setup geral do datepicker
                    options.locale = moment.locale();
                    if ((datepickerAttr.toLowerCase() === "date-time") || (datepickerAttr.toLowerCase() === "datetime") || (datepickerAttr.toLowerCase() === "date.time")) {
                        options.format = 'L LT';
                        format = moment.localeData(moment.locale()).longDateFormat("L") + " " + moment.localeData().longDateFormat("LT");
                        options.useCurrent = 'minute';
                    } else if ((datepickerAttr) === "time") {
                        options.format = 'LT';
                        format = moment.localeData(moment.locale()).longDateFormat("LT");
                        options.useCurrent = 'minute';
                    } else if ((datepickerAttr === "") || (datepickerAttr === "date")) {
                        options.format = 'L';
                        format = moment.localeData(moment.locale()).longDateFormat("L");
                        options.useCurrent = 'day';
                    } else {
                        format = datepickerAttr;
                        options.format = format;
                        options.useCurrent = 'minute';
                    }

                    // Para o ng-mask. Campos devem ser obrigatoriamente 'padded' (e.g. 02 ao invés de 2).
                    maskFormat = format.replace(/DD/, '39').replace(/MM/, '19').replace(/YYYY/i, '2999').replace(/yy/i, '99').replace(/hh/i, '29').replace(/mm/, '59').replace(/ss/, '59');

                    //placeholder usa o format
                    element.attr('placeholder', format.toLowerCase());
                    attrs.mask = maskFormat;

                    //prepara e aplica a mascara de data, chamar mask() destroi a mascara já criada
                    if (mask) {
                        mask();
                    }
                    mask = DatepickerConfig.mask(scope, element, attrs, MaskService, ngMaskConfig, $timeout, ngModel);

                    //aplica o datepicker bootstrap
                    if (dateWrap.data('DateTimePicker')) {
                        dateWrap.data('DateTimePicker').destroy();
                    }
                    dateWrap.datetimepicker(options);
                    if (ngModel.$modelValue) {
                        element.val(ngModel.$formatters[1](ngModel.$modelValue));
                        dateWrap.data('DateTimePicker').date(ngModel.$modelValue);
                    }
                };
                setupDp();


                scope.$on('jedi.i18n.LanguageChanged', setupDp);

                dateWrap.on('dp.change', function dpChange(e) {
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
                    var parsedValue;
                    if (!viewValue) {
                        ngModel.$setValidity('datepicker', true);
                        ngModel.$setValidity('mask', true);
                        parsedValue = viewValue;
                    } else if (moment.isMoment(viewValue) && viewValue.isValid()) {
                        ngModel.$setValidity('datepicker', true);
                        ngModel.$setValidity('mask', true);
                        parsedValue = viewValue;
                    } else if (angular.isDate(viewValue) && !isNaN(viewValue)) {
                        ngModel.$setValidity('datepicker', true);
                        ngModel.$setValidity('mask', true);
                        parsedValue = viewValue;
                    } else if (angular.isString(viewValue)) {
                        var date = moment(viewValue, format, true);
                        if (date.isValid()) {
                            ngModel.$setValidity('datepicker', true);
                            ngModel.$setValidity('mask', true);
                            parsedValue = date.toDate();
                        } else {
                            ngModel.$setValidity('datepicker', false);
                            parsedValue = viewValue;
                        }
                    } else {
                        ngModel.$setValidity('datepicker', false);
                        parsedValue = viewValue;
                    }

                    if (parsedValue != dateWrap.data('DateTimePicker').date()) {
                        dateWrap.data('DateTimePicker').date(parsedValue);
                    }

                    return parsedValue;

                });

                var dateFormatter = function dateFormatter(value) {
                    var date;
                    if (!value) {
                        return value;
                    } else if (moment.isMoment(value) && value.isValid()) {
                        return value.format(format);
                    } else if (angular.isDate(value) && !isNaN(value)) {
                        date = moment(value);
                        return date.format(format);
                    } else if (angular.isString(value)) {
                        date = moment(value, format, true);
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
                };
                ngModel.$formatters.push(dateFormatter);

                //Seta min e max date para o Datepicker - possibilita que dois datepickers sejam usados linkados um ao outro
                if (attrs.jdMinDate) {
                    scope.$watch(attrs.jdMinDate, function watchMinDate() {
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
                    scope.$watch(attrs.jdMaxDate, function watchMaxDate() {
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
                dateWrap.on('dp.show', function dpShowWidget(e) {
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
                scope.$on('$destroy', function dpDestroy() {
                    if (dateWrap) {
                        var dtPicker = dateWrap.data('DateTimePicker');
                        if (dtPicker) {
                            dtPicker.destroy();
                        }
                    }
                });
                // se input destruido remove wrap
                element.on('$destroy', function elDestroy() {
                    if (dateWrap) {
                        var w = dateWrap;
                        dateWrap = null;
                        w.remove();
                    }
                    scope.$destroy();
                });
            }
        };
    }]);