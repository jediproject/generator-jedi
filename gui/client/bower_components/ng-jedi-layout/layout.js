/*
 ng-jedi-layout v0.0.1
 AngularJs UI jedi component
 https://github.com/jediproject/ng-jedi-layout
*/
(function (factory) {
    if (typeof define === 'function') {
        define(['moment', 'ng-jedi-utilities', 'angular-ngMask', 'bootstrap-datetimepicker'], factory);
    } else {
        if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports){
            module.exports = 'jedi.layout';
        }
        return factory();
    }
}(function() {
	"use strict";

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
    angular.module('jedi.layout.panel', ['jedi.utilities']).constant('jedi.layout.panel.PanelConfig', {
        defaultElementClass: 'panel-body form-horizontal',
        defaultFormClass: 'form-validation',
        defaultBoxedClass: 'page',
        templateUrl: 'assets/libs/ng-jedi-layout/panel.html'
    }).run(['$templateCache', function($templateCache) {
        $templateCache.put('assets/libs/ng-jedi-layout/panel.html', '<div class="{{jdPanel}}">'+
                                                                    '    <section class="panel panel-default">'+
                                                                    '        <div class="panel-heading" ng-show="showTitle">'+
                                                                    '            <strong><span ng-show="showTitleIcon" class="glyphicon {{jdTitleIcon}}"></span><jd-i18n>{{jdTitle}}</jd-i18n></strong>'+
                                                                    '        </div>'+
                                                                    '        <ng-transclude></ng-transclude>'+
                                                                    '    </section>'+
                                                                    '</div>');
    }]).directive('jdPanel', ['jedi.utilities.Utilities', 'jedi.layout.panel.PanelConfig', '$timeout', '$compile', '$filter', '$templateCache', function (utilities, PanelConfig, $timeout, $compile, $filter, $templateCache) {
        return {
            restrict: 'A',
            compile: function (element, attrs) {
                // centralizar painel, usar classes: col-md-8 col-md-offset-2
                element.addClass(PanelConfig.defaultElementClass);

                if (element.is('form')) {
                    element.addClass(PanelConfig.defaultFormClass);
                    if (!attrs.name && attrs.jdTitle) {
                        element.attr('name', $filter('jdReplaceSpecialChars')(attrs.jdTitle));
                    }
                    if (angular.isUndefined(attrs.novalidate)) {
                        element.attr('novalidate', '');
                    }
                }

                if (attrs.jdPanel != '') {
                    attrs.jdPanel = 'col-lg-' + attrs.jdPanel;
                } else if (element.parents('.jd-panel:first, .jd-modal:first').length == 0) {
                    attrs.jdPanel = PanelConfig.defaultBoxedClass;
                    element.addClass('jd-panel');
                }

                // se jdTitleIcon definido vazio então fica sem icone
                if (typeof attrs.jdTitleIcon == 'undefined') {
                    attrs.jdTitleIcon = 'glyphicon-th';
                }

                if (typeof attrs.jdToggle != 'undefined') {
                    attrs.jdTitleIcon = attrs.jdToggle.toLowerCase().trim() == 'false' ? 'glyphicon-chevron-right' : 'glyphicon-chevron-down';
                }

                return {
                    pre: function (scope, element, attrs) {},
                    post: function (scope, element, attrs) {
                        var template = $templateCache.get(PanelConfig.templateUrl);
                        var wrapper = $(template.replace('ng-transclude', 'transclude'));
                        var panelHead = wrapper.find('.panel-heading');
                        var panelBody = wrapper.find('transclude,[transclude]');
                        // se definido área de transclude, insere antes do element e move o element pro body do transclude
                        if (panelBody.length > 0) {
                            wrapper.insertBefore(element);
                            // cris subscopo para o panel
                            var pScope = scope.$new();
                            pScope = angular.extend(pScope, {
                                showTitle: typeof attrs.jdTitle != 'undefined',
                                showTitleIcon: attrs.jdTitleIcon !== 'false' && attrs.jdTitleIcon !== '',
                                jdPanel: attrs.jdPanel,
                                jdTitleIcon: attrs.jdTitleIcon,
                                jdTitle: attrs.jdTitle,
                                jdToggle: attrs.jdToggle
                            });
                            $compile(wrapper)(pScope);
                            // adiciona body na área de transclude
                            panelBody.append(element);

                            var footer = element.children('.panel-footer');
                            if (footer.length > 0) {
                                element.after(footer);
                            }

                            var panelContent = element.add(footer);

                            var toggleElement;

                            if (typeof attrs.jdToggle != 'undefined') {
                                var $target = panelHead.find('.glyphicon');

                                var doneToggling = function doneToggling(changeScope) {
                                    if (panelContent.is(':visible')) {
                                        $target.removeClass('glyphicon-chevron-right');
                                        $target.addClass('glyphicon-chevron-down');
                                    } else {
                                        $target.removeClass('glyphicon-chevron-down');
                                        $target.addClass('glyphicon-chevron-right');
                                    }
                                    if (!changeScope && attrs.jdToggle !== "" && attrs.jdToggle !== "true" && attrs.jdToggle !== "false" && scope.$eval(attrs.jdToggle) != panelContent.is(':visible')) {
                                        scope.$eval(attrs.jdToggle + ' = value', { value: panelContent.is(':visible') });
                                        scope.$apply();
                                    }
                                };

                                var animateStyles = {
                                    height: 'toggle',
                                    'padding-top': 'toggle',
                                    'padding-bottom': 'toggle'
                                };

                                var toggle = function toggle(changeScope) {
                                    var animateOptions = {
                                        duration: 200,
                                        easing: 'linear',
                                        queue: false,
                                        done: function(evt) {
                                            // stop emite evento done, if adicionado para não passar pelo doneToggling 2x
                                            if (panelContent.is(':visible') == $target.hasClass('glyphicon-chevron-right')) {
                                                doneToggling(changeScope);
                                            }
                                        }
                                    };
                                    panelContent.stop().animate(animateStyles, animateOptions);
                                };

                                var hide = function() {
                                    panelContent.hide();
                                    $timeout(function () {
                                        doneToggling(true);
                                    });
                                };

                                toggleElement = panelHead.find('*:first').addClass('toggleable').click(function (e) {
                                    toggle();
                                    e.stopPropagation();
                                    return false;
                                });

                                if (attrs.jdToggle.toLowerCase().trim() === 'false') {
                                    hide();
                                } else if (attrs.jdToggle.toLowerCase().trim() !== "") {
                                    // se attrs.jdToggle false, já deixa área fechada
                                    var initialState = scope.$eval(attrs.jdToggle);
                                    if (initialState != undefined && initialState != panelContent.is(':visible')) {
                                        hide();
                                    }
                                    scope.$watch(function() {
                                        return scope.$eval(attrs.jdToggle);
                                    }, function (newValue, oldValue) {
                                        if (newValue != oldValue && newValue != panelContent.is(':visible')) {
                                            toggle(true);
                                        }
                                    });
                                }
                            }

                            // destroy
                            // se escopo destruido remove eventos
                            scope.$on('$destroy', function () {
                                if (toggleElement) {
                                    toggleElement.unbind('click');
                                }
                                pScope.$destroy();
                            });
                            // se input destruido remove wrap
                            element.on('$destroy', function () {
                                if (wrapper) {
                                    var w = wrapper;
                                    wrapper = null;
                                    toggleElement = null;
                                    w.remove();
                                }
                                scope.$destroy();
                            });
                        }
                    }
                }
            }
        }
    }]);
    angular.module('jedi.layout.modal', []).constant('jedi.layout.modal.ModalConfig', {
        defaultFormClass: 'form-validation',
        defaultTableClass: 'table-dynamic',
        defaultTemplateUrl: 'assets/libs/ng-jedi-layout/modal.html'
    }).directive('jdModal', ['jedi.layout.modal.ModalConfig', '$timeout', '$compile', '$filter', function (ModalConfig, $timeout, $compile, $filter) {
        return {
            restrict: "A",
            priority: 1000.1,
            compile: function compile(cElement, cAttrs, cTransclude) {
                cElement.addClass('jd-modal');
                
                if (cElement.is('form')) {
                    cElement.addClass(ModalConfig.defaultFormClass);
                    if (!cAttrs.name && cAttrs.jdTitle) {
                        cElement.attr('name', $filter('jdReplaceSpecialChars')(cAttrs.jdTitle));
                    }
                    if (angular.isUndefined(cAttrs.novalidate)) {
                        cElement.attr('novalidate', '');
                    }
                }

                if (ModalConfig.defaultTableClass) {
                    var table = cElement.find('table.table');
                    if (table.length > 0 && !cElement.hasClass(ModalConfig.defaultTableClass)) {
                        cElement.addClass(ModalConfig.defaultTableClass);
                    }
                }

                var footer = cElement.find('.modal-footer');
                if (footer.length > 0) {
                    var f = footer[0].outerHTML;
                    // remove o footer antes do transclude para adicionar no post link
                    // footer deve ser "irmão" do body, da forma utilizada, dentro do body, ele precisa ser movido pra fora e recompilado
                    footer.remove();
                    footer = f;
                }

                return function (scope, element) {
                    if (footer) {
                        footer = jQuery(footer);
                        element.append(footer);
                        $compile(footer)(scope);
                    }

                    var form = element.find('form:first');
                    if (form.length > 0) {
                        $timeout(function () {
                            // seta foco no primeiro cElemento do form
                            jQuery(":input:visible:enabled", form).not('[readonly]').filter(':first').focus();
                        }, 10);
                    }

                    element.find('[jd-dismiss-modal]').on('click', function () {
                        scope.$dismiss();
                        return false;
                    });

                    // destroy
                    // se escopo destruido remove eventos
                    scope.$on('$destroy', function () {
                        element.find('[jd-dismiss-modal]').unbind('click');
                    });
                };
            }
        }
    }]).directive('jdModal', ['jedi.layout.modal.ModalConfig', '$timeout', '$compile', function (ModalConfig, $timeout, $compile) {
        return {
            restrict: "A",
            replace: true,
            transclude: 'element',
            priority: 1000,
            scope: {
                jdTitle: '@',
                jdTemplateUrl: '@'
            },
            templateUrl: function (elem, attrs) {
                if (attrs.jdTemplateUrl) {
                    return attrs.jdTemplateUrl;
                } else {
                    return ModalConfig.defaultTemplateUrl;
                }
            },
            controller: ['$scope', '$attrs', '$element', function Controller($scope, $attrs, $element) {
                $scope.closeModal = function () {
                    $scope.$parent.$dismiss();
                    return false;
                };
            }]
        }
    }]).run(['$templateCache', function ($templateCache) {
        $templateCache.put('assets/libs/ng-jedi-layout/modal.html', '<div>'+
                                                                    '    <div class="panel-heading modal-header">'+
                                                                    '      <strong><span class="glyphicon glyphicon-th"></span><jd-i18n>{{jdTitle}}</jd-i18n></strong>'+
                                                                    '      <span class="glyphicon glyphicon-remove close" ng-click="closeModal()"></span>'+
                                                                    '    </div>'+
                                                                    '    <div class="modal-body form-horizontal" ng-transclude>'+
                                                                    '    </div>'+
                                                                    '</div>');
    }]);

    angular.module('jedi.layout.treeview', []).constant('jedi.layout.treeview.TreeviewConfig', {
        emptyTpl: '<div id="emptyTreeElement"><strong class="text-warning" jd-i18n>{{emptyMsgLabel}}</strong></div>',
        nodeTpl: '<li ng-repeat="{{repeatExp}}"><a class="angular-ui-tree-handle angular-ui-tree-hover" ng-click="toggle($event)" onclick="$(this).next().toggle();" href="javascript:;"><span class="fa fa-minus-square"></span>&nbsp;<strong>{{label}}</strong></a><ol class="angular-ui-tree-nodes"></ol></li>',
        lastNodeTpl: '<li class="angular-ui-tree-hover" ng-repeat="{{repeatExp}}" ng-class="{\'selected\' : {{rowItem}} == selectedItem}" ng-click="changeClass({{rowItem}})"></li>',
        emptyMsgLabel: 'No items found.'
    }).directive('jdTreeview', ['jedi.layout.treeview.TreeviewConfig', '$interpolate', function (TreeviewConfig, $interpolate) {
        return {
            restrict: 'A',
            compile: function (element, attributes) {
				if (!element.hasClass('angular-ui-tree-nodes')) {
					element.addClass('angular-ui-tree-nodes');
				}

                element.children().addClass('angular-ui-tree-child');

                var children = element.children();

                var list = attributes.jdTreeview.split(';');
                var parent = element;

                parent.addClass('pre-scrollable');

                angular.forEach(list, function (item) {
                    var labelField = item.match(/\[.*\]/g);
                    if (labelField && labelField.length > 0) {
                        labelField = labelField[0];
                        item = item.replace(labelField, '');
                        labelField = labelField.replace('[', '').replace(']', '');
                    } else {
                        labelField = undefined;
                    }

                    var child;
                    var rowItem = item.trim().split(' ')[0];
                    if (labelField) {
                        child = $($interpolate(TreeviewConfig.nodeTpl)(angular.extend({ repeatExp: item, label: '{{'+labelField+'}}' }, attributes)));
                        parent.append(child);
                        parent = child.find('ol:first');
                    } else {
                        child = $($interpolate(TreeviewConfig.lastNodeTpl)(angular.extend({ repeatExp: item, rowItem: rowItem }, attributes)));
                        parent.append(child);
                        parent = child;
                    }
                });
                parent.append(children);
                parent.addClass('angular-ui-tree-nodes-last');

                return {
                    post: function postLink(scope, iElement, iAttrs, controller) {
                        scope.$watch(
                            function () {
                                var list = iAttrs.jdTreeview.split(';');
                                var firstNode = list[0].split(' ')[2];
                                var listValue = scope.$eval(firstNode);
                                return listValue;
                            },
                            function (newValue, oldValue) {
                                iElement.children().remove("#emptyTreeElement");
                                //If content is null or undefined, doesn't show any content.
                                if (!newValue) {
                                    iElement.hide();
                                } else {
                                    iElement.show();
                                    //If the new list TreeView(newValue) contains an empty array, show alert message.
                                    if (newValue != oldValue && newValue.length === 0) {
                                        var emptyTreeViewTemplate = $interpolate(TreeviewConfig.emptyTpl)(angular.extend({emptyMsgLabel: TreeviewConfig.emptyMsgLabel}, iAttrs));
                                        var emptyTreeViewElement = angular.element(emptyTreeViewTemplate);
                                        iElement.append(emptyTreeViewElement);
                                    }
                                }
                            }
                        );

                        scope.selectedItem = undefined;
                        scope.collapsed = false;

                        scope.changeClass = function (item) {
                            scope.selectedItem = item;
                        };

                        scope.toggle = function ($event) {
                            var elementToToggle = angular.element($event.currentTarget.firstChild);

                            if (elementToToggle.hasClass('fa fa-minus-square')) {
                                elementToToggle.removeClass('fa fa-minus-square');
                                elementToToggle.addClass('fa fa-plus-square');
                            } else {
                                elementToToggle.removeClass('fa fa-plus-square');
                                elementToToggle.addClass('fa fa-minus-square');
                            }
                        };
                    }
                }
            }
        };
    }]);
    angular.module('jedi.layout.input', []).constant('jedi.layout.input.InputConfig', {
        specificSizes: {
            "{{(type === 'radio' || type === 'checkbox') && (jdRepeat == undefined || jdRepeat == '')}}": {
                xsSize: 12,
                smSize: 3,
                mdSize: 3,
                lgSize: 3,
                xsLabelSize: 0,
                smLabelSize: 0,
                mdLabelSize: 0,
                lgLabelSize: 0,
                xsInputSize: 12,
                smInputSize: 12,
                mdInputSize: 12,
                lgInputSize: 12
            }
        },
        specificSizesProportion: {

        },
        lgSizesProportion: {
            "1": { mdSize: 1, smSize: 2, xsSize: 12 },
            "2": { mdSize: 2, smSize: 3, xsSize: 12 },
            "3": { mdSize: 3, smSize: 3, xsSize: 12 },
            "4": { mdSize: 4, smSize: 4, xsSize: 12 },
            "5": { mdSize: 5, smSize: 5, xsSize: 12 },
            "6": { mdSize: 6, smSize: 6, xsSize: 12 },
            "7": { mdSize: 7, smSize: 7, xsSize: 12 },
            "8": { mdSize: 8, smSize: 8, xsSize: 12 },
            "9": { mdSize: 9, smSize: 9, xsSize: 12 },
            "10": { mdSize: 10, smSize: 10, xsSize: 12 },
            "11": { mdSize: 11, smSize: 11, xsSize: 12 },
            "12": { mdSize: 12, smSize: 12, xsSize: 12 }
        },
        defaultSizes: {
            xsSize: 12,
            smSize: 3,
            mdSize: 3,
            lgSize: 3,
            xsLabelSize: 12,
            smLabelSize: 12,
            mdLabelSize: 12,
            lgLabelSize: 12,
            xsInputSize: 12,
            smInputSize: 12,
            mdInputSize: 12,
            lgInputSize: 12
        },
        maxSize: 12,
        templateSelector: {
            "{{(type === 'radio' || type === 'checkbox') && jdRepeat != undefined && jdRepeat != ''}}": 'assets/libs/ng-jedi-layout/input-multipleinput.html',
            "{{(type === 'radio' || type === 'checkbox') && (jdRepeat == undefined || jdRepeat == '')}}": 'assets/libs/ng-jedi-layout/input-oneinput.html'
        },
        defaultTemplate: 'assets/libs/ng-jedi-layout/input-single.html',
        useValidationTooltip: true
    }).directive("jdInput", ['jedi.layout.input.InputConfig', '$filter', function (InputConfig, $filter) {
        // prepara input antes de realizar transclude
        return {
            restrict: "A",
            priority: 1000.2,
            compile: function compile(cElement, cAttrs) {
                if (!cElement.attr('id')) {
                    cElement.attr('id', cElement.attr('ng-model'));
                    if (!cElement.attr('id')) {
                        cElement.attr('id', cElement.attr('name'));
                        if (!cElement.attr('id')) {
                            cElement.attr('id', $filter('jdReplaceSpecialChars')(cElement.attr('jd-label')));
                        }
                    }
                    cAttrs.id = cElement.attr('id');
                }

                if (!cElement.attr('name')) {
                    cElement.attr('name', cElement.attr('id'));
                }

                if (!cElement.attr('jd-i18n')) {
                    cElement.attr('jd-i18n', '');
                }

                if (cElement.is(':input') && !cElement.is(':radio') && !cElement.is(':checkbox') && !cElement.hasClass('form-control')) {
                    cElement.addClass('form-control');
                }

                if (!cAttrs.type && !cElement.is(':input')) {
                    cAttrs.type = 'statictext';
                }

                if (cAttrs.jdRepeat) {
                    if (cElement.attr('ng-value') && cElement.attr('ng-value').indexOf('$parent') < 0 && cElement.attr('ng-value') != 'true' && cElement.attr('ng-value') != 'false') {
                        cElement.attr('ng-value', '$parent.' + cElement.attr('ng-value'));
                    }
                    if (cElement.attr('ng-model') && cElement.attr('ng-model').indexOf('$parent') < 0) {
                        cElement.attr('ng-model', '$parent.$parent.$parent.' + cElement.attr('ng-model').replace('$index', '$parent.$index'));
                    }
                }

                if (cElement.is('textarea')) {
                    cAttrs.type = 'textarea';
                }

                if (cElement.is('select')) {
                    cAttrs.type = 'select';
                    if (cElement.attr('ng-model').indexOf('$parent') < 0) {
                        cElement.attr('ng-model', '$parent.$parent.' + cElement.attr('ng-model'));
                    }
                }

                if (cAttrs.jdOptions) {
                    cElement.attr('ng-options', cAttrs.jdOptions);
                }

                if (InputConfig.useValidationTooltip && !cAttrs.jdValidationTooltip && cAttrs.ngModel && cElement.is(':input')) {
                    cElement.attr('jd-validation-tooltip', '');
                }

                if (!cAttrs.required && cElement.find(':input[required],:input[ng-required],:input[data-ng-required]').length > 0) {
                    cAttrs.required = true;
                }
            }
        };
    }]).directive("jdInput", ['jedi.layout.input.InputConfig', '$interpolate', function (InputConfig, $interpolate) {
        // realiza transclude+template no input
        return {
            restrict: "A",
            replace: true,
            transclude: 'element',
            scope: {
                jdLabel: '@',
                jdGrouplabel: '@',
                id: '@',
                type: '@',
                jdXsSize: '@',
                jdSmSize: '@',
                jdMdSize: '@',
                jdLgSize: '@',
                jdXsLabelSize: '@',
                jdSmLabelSize: '@',
                jdMdLabelSize: '@',
                jdLgLabelSize: '@',
                jdXsInputSize: '@',
                jdSmInputSize: '@',
                jdMdInputSize: '@',
                jdLgInputSize: '@',
                jdHelp: '@',
                jdInputClass: '@',
                jdLabelClass: '@',
                jdElementClass: '@'
            },
            priority: 1000.1,
            templateUrl: function (elem, attrs) {
                var _tpl;

                jQuery.each(InputConfig.templateSelector, function (expression, template) {
                    var checkTemplate = $interpolate(expression)(attrs) === "true";

                    if (checkTemplate) {
                        _tpl = template;
                        return false;
                    }
                });

                if (_tpl) {
                    return _tpl;
                } else {
                    return InputConfig.defaultTemplate;
                }
            },
            controller: ['$scope', '$attrs', '$element', function Controller($scope, $attrs, $element) {
                if ($attrs.jdRepeat) {
                    $scope.showLabel = $attrs.jdGrouplabel && $attrs.jdGrouplabel !== '';
                } else {
                    $scope.showLabel = $attrs.jdLabel && $attrs.jdLabel !== '';
                }

                $scope.showRequired = angular.isDefined($attrs.required) || angular.isDefined($attrs.ngRequired) || angular.isDefined($attrs.dataNgRequired) ? ' *' : '';

                $scope.showHelp = $attrs.jdHelp && $attrs.jdHelp !== '';

                //**Valores para a div root(Encobre o label + input)**
                //Se o tamanho foi informado pelo jdInput, são usados valores proporcionais (xs/sm/md/lg)
                if ($attrs.jdInput) {
                    $scope.jdLgSize = $attrs.jdInput;
                    $attrs.jdLgSize = $attrs.jdInput;

                    var specificProportions;
                    jQuery.each(InputConfig.specificSizesProportion, function (proportionExpression, proportionSizes) {
                        var checkProportion = $interpolate(proportionExpression)($attrs) === 'true';

                        if (checkProportion) {
                            specificProportions = proportionSizes;
                            return false;
                        }
                    });

                    if (specificProportions) {
                        var specificProportion = specificProportions[$attrs.jdInput];
                        jQuery.each(specificProportion, function (size, value) {
                            size = 'jd' + size.charAt(0).toUpperCase() + size.substr(1);
                            //apenas uso a proporção caso a pessoa não informar o tamanho.
                            if (!$attrs[size]) {
                                $scope[size] = value; // atribui valor proporcional
                                $attrs[size] = $scope[size];
                            }
                        });

                        return;
                    }

                    var lgSizeProportion = InputConfig.lgSizesProportion[$attrs.jdInput];
                    jQuery.each(lgSizeProportion, function (size, value) {
                        size = 'jd' + size.charAt(0).toUpperCase() + size.substr(1);
                        //apenas uso a proporção caso a pessoa não informar o tamanho.
                        if (!$attrs[size]) {
                            $scope[size] = value; // atribui valor proporcional
                            $attrs[size] = $scope[size];
                        }
                    });
                }

                var maxSize = InputConfig.maxSize;

                var sizesToUse = InputConfig.defaultSizes;
                jQuery.each(InputConfig.specificSizes, function (expression, sizes) {
                    var checkSizes = $interpolate(expression)($attrs) === 'true';

                    if (checkSizes) {
                        sizesToUse = sizes;
                        return false;
                    }
                });

                jQuery.each(sizesToUse, function (size, value) {
                    size = 'jd' + size.charAt(0).toUpperCase() + size.substr(1);
                    // apenas ajusto os valores caso a pessoa não informar o tamanho.
                    if (!$attrs[size]) {
                        //atribui valor default
                        $scope[size] = value;

                        // se tamanho de label definido e não for definido o tamanho do input, atribui o input sendo a diferença entre o label
                        if (size.indexOf('Label') > -1) {
                            var inputSize = size.replace('Label', 'Input');
                            if ($attrs[inputSize]) {
                                var inputSizeValue = parseInt($attrs[inputSize]);
                                $scope[size] = inputSizeValue == maxSize ? maxSize : maxSize - inputSizeValue;
                            }
                        }

                        // se tamanho de input definido e não for definido o tamanho do label, atribui o label sendo a diferença entre o input
                        if (size.indexOf('Input') > -1) {
                            var labelSize = size.replace('Input', 'Label');
                            if ($attrs[labelSize]) {
                                var labelSizeValue = parseInt($attrs[labelSize]);
                                $scope[size] = labelSizeValue == maxSize ? maxSize : maxSize - labelSizeValue;
                            }
                        }

                        $attrs[size] = $scope[size];
                    }
                });
            }],
            compile: function compile(cElement, cAttrs, cTransclude) {
                // caso haja jdRepeat, atribui ng-repeat no lugar, para que não dê problema com transclude+template
                if (cAttrs.jdRepeat) {
                    var repeatElement = cElement.find('[ng-repeat]');
                    if (cAttrs.jdRepeat.indexOf('$parent') < 0) {
                        repeatElement.attr('ng-repeat', cAttrs.jdRepeat.replace(/\s+in\s+/, ' in $parent.'));
                    } else {
                        repeatElement.attr('ng-repeat', cAttrs.jdRepeat);
                    }
                    repeatElement.html(repeatElement.html().replace('{{jdLabel}}', cAttrs.jdLabel));
                }

                return function (scope, element, attrs, ctrl, transclude) {
                    if (attrs.jdElementClass) {
                        element.find('ng-transclude:first > :first-child,[ng-transclude]:first > :first-child').addClass(attrs.jdElementClass);
                    }

                    // se element for do tipo select, ajusta os ctrls para correto binding do model
                    if (element.is('[type=select]')) {
                        var ctrlTpl = element.controller('select');
                        var ctrlSelect = element.find('select').controller('select');
                        if (ctrlTpl && ctrlSelect) {
                            // substitui ctrl do select e ngModel contidos no template para usar os do select
                            ctrlTpl.ngModelCtrl = ctrlSelect.ngModelCtrl;
                            ctrlTpl.unknownOption = ctrlSelect.unknownOption;
                            ctrlTpl.renderUnknownOption = ctrlSelect.renderUnknownOption;
                            ctrlTpl.removeUnknownOption = ctrlSelect.removeUnknownOption;
                            ctrlTpl.readValue = ctrlSelect.readValue;
                            ctrlTpl.writeValue = ctrlSelect.writeValue;
                            ctrlTpl.addOption = ctrlSelect.addOption;
                            ctrlTpl.removeOption = ctrlSelect.removeOption;
                            ctrlTpl.hasOption = ctrlSelect.hasOption;
                        }
                    }
                };
            }
        };
    }]).run(['$templateCache', function ($templateCache) {
        $templateCache.put('assets/libs/ng-jedi-layout/input-single.html',  '<div class="col-xs-{{jdXsSize}} col-sm-{{jdSmSize}} col-md-{{jdMdSize}} col-lg-{{jdLgSize}} jd-{{type}}">'+
                                                                            '    <div class="form-group">'+
                                                                            '        <label ng-if="showLabel" for="{{id}}" class="col-xs-{{jdXsLabelSize}} col-sm-{{jdSmLabelSize}} col-md-{{jdMdLabelSize}} col-lg-{{jdLgLabelSize}} {{jdLabelClass}} control-label" jd-i18n>{{jdLabel}}{{showRequired}}</label>'+
                                                                            '        <div class="col-xs-{{jdXsInputSize}} col-sm-{{jdSmInputSize}} col-md-{{jdMdInputSize}} col-lg-{{jdLgInputSize}} {{jdInputClass}}">'+
                                                                            '            <ng-transclude></ng-transclude>'+
                                                                            '            <small class="help-block" ng-if="showHelp" jd-i18n>{{jdHelp}}</small>'+
                                                                            '        </div>'+
                                                                            '    </div>'+
                                                                            '</div>');

        $templateCache.put('assets/libs/ng-jedi-layout/input-multipleinput.html', '<div class="col-xs-{{jdXsSize}} col-sm-{{jdSmSize}} col-md-{{jdMdSize}} col-lg-{{jdLgSize}} jd-multi-{{type}}">'+
                                                                                  '    <div class="form-group">'+
                                                                                  '        <label ng-if="showLabel" class="col-xs-{{jdXsLabelSize}} col-sm-{{jdSmLabelSize}} col-md-{{jdMdLabelSize}} col-lg-{{jdLgLabelSize}} {{jdLabelClass}} control-label" jd-i18n>{{jdGrouplabel}}{{showRequired}}</label>'+
                                                                                  '        <div class="col-xs-{{jdXsInputSize}} col-sm-{{jdSmInputSize}} col-md-{{jdMdInputSize}} col-lg-{{jdLgInputSize}} {{jdInputClass}}">'+
                                                                                  '            <label class="{{type}}-inline" ng-repeat>'+
                                                                                  '                <ng-transclude></ng-transclude>{{jdLabel}}'+
                                                                                  '            </label>'+
                                                                                  '            <small class="help-block" ng-if="showHelp" jd-i18n>{{jdHelp}}</small>'+
                                                                                  '        </div>'+
                                                                                  '    </div>'+
                                                                                  '</div>');

        $templateCache.put('assets/libs/ng-jedi-layout/input-oneinput.html', '<div class="col-xs-{{jdXsSize}} col-sm-{{jdSmSize}} col-md-{{jdMdSize}} col-lg-{{jdLgSize}} jd-{{type}}">'+
                                                                             '    <div class="form-group">'+
                                                                             '        <div class="col-xs-offset-{{jdXsLabelSize}} col-sm-offset-{{jdSmLabelSize}} col-md-offset-{{jdMdLabelSize}} col-lg-offset-{{jdLgLabelSize}} {{jdLabelClass}} col-xs-{{jdXsInputSize}} col-sm-{{jdSmInputSize}} col-md-{{jdMdInputSize}} col-lg-{{jdLgInputSize}} {{jdInputClass}}">'+
                                                                             '            <div class="{{type}}">'+
                                                                             '                <label>'+
                                                                             '                    <ng-transclude></ng-transclude>{{jdLabel}}{{showRequired}}'+
                                                                             '                </label>'+
                                                                             '            </div>'+
                                                                             '            <small class="help-block" ng-if="showHelp" jd-i18n>{{jdHelp}}</small>'+
                                                                             '        </div>'+
                                                                             '    </div>'+
                                                                             '</div>');
    }]);
    angular.module('jedi.layout.validationtooltip', []).constant('jedi.layout.validationtooltip.ValidationTooltipConfig', {
        messages: {
            'required': 'Required field.',
            'minlength': 'Field should have at least {{minLength}} characters.',
            'maxlength': 'Field should have at maximum {{maxLength}} characters.',
            'pattern': 'Invalid value.',
            'equal': 'Value should match the previous field.',
            'email': 'Invalid email.',
            'url': 'Invalid Url.',
            'number': 'Please use a valid number.',
            'datepicker': 'Plase use a valid date.',
            'date': 'Plase use a valid date.',
            'min': 'Use a number starting from {{min}}.',
            'max': 'Use a number that is less or equal to {{max}}.',
            'cpf': 'Invalid CPF.',
            'cnpj': 'Invalid CNPJ.',
            'default': 'Invalid value.'
        }
    }).directive('jdValidationTooltip', ['$injector', '$interpolate', 'jedi.layout.validationtooltip.ValidationTooltipConfig', function ($injector, $interpolate, ValidationTooltipConfig) {
        var localize;
        try {
            localize = $injector.get('jedi.i18n.Localize');
        } catch (e) { }

        return {
            restrict: 'A',
            require: '^ngModel',
            link: function (scope, element, attrs, ngModel) {
				var minLength = attrs['ngMinlength'];
                var maxLength = attrs['ngMaxlength'];

                if (minLength) {
                    element.attr('minLength', minLength);
                    attrs.minLength = minLength;
                }

                if (maxLength) {
                    element.attr('maxLength', maxLength);
                    attrs.maxLength = maxLength;
                }

                element.on('change.jdValidationTooltip click.jdValidationTooltip input.jdValidationTooltip paste.jdValidationTooltip keyup.jdValidationTooltip', function () {
                    element.removeData('jd-modelstate-errors');
                });

                scope.$watch(function () {
                    return (ngModel.$dirty && ngModel.$invalid) || angular.isDefined(element.data('jd-modelstate-errors'));
                }, function (value) {
                    var tooltip = element.data('bs.tooltip');
                    if (value) {
                        scope.$watch(function () {
                            return element.data('bs.tooltip');
                        }, function (value) {
                            if (!value && !_.isEmpty(ngModel.$error)) {
                                element.tooltip({ trigger: 'manual', container: 'body' });
                                element.on('focus.jdValidationTooltip mouseenter.jdValidationTooltip', function () {
                                    var _tooltip = element.data('bs.tooltip');
                                    var listError = Object.getOwnPropertyNames(ngModel.$error);
                                    var error;

                                    // required possui preferência sobre os outros erros, já que quando o campo estiver vazio, deve aparecer a mensagem adequada.
                                    if (_.contains(listError, "required")) {
                                        error = "required";
                                    } else {
                                        var isFirefox = typeof InstallTrigger !== 'undefined';
                                        //No firefox, a mensagem correta fica no final do array.
                                        if (isFirefox) {
                                            error = listError[listError.length - 1];
                                        } else {
                                            error = listError[0];
                                        }
                                    }

                                    var message = ValidationTooltipConfig.messages[error];
                                    if (!message) {
                                        if (error == 'jdAsyncValidate') {
                                            message = attrs.jdAsyncValidateMessage;
                                        }
                                        if (!message) {
                                            message = element.data('jd-modelstate-errors');
                                            if (!message) {
                                                message = attrs[error + 'Message'];
                                                if (!message) {
                                                    message = ValidationTooltipConfig.messages.default;
                                                }
                                            }
                                        }
                                    }

                                    // interpolate message
                                    message = $interpolate(message)(angular.extend({}, scope, attrs));

                                    if (!_tooltip.tip().hasClass('in') || _tooltip.options.title != message) {
                                        _tooltip.options.title = (localize ? localize.get(message) : message);
                                        if ((window.innerWidth || document.documentElement.clientWidth) < 995) {
                                            _tooltip.options.placement = 'top';
                                        } else {
                                            _tooltip.options.placement = 'right';
                                        }
                                        element.tooltip('show');
                                    }
                                });

                                // oculta tooltip ao perder foco
                                element.on('blur.jdValidationTooltip mouseleave.jdValidationTooltip', function () {
                                    var _tooltip = element.data('bs.tooltip');
                                    if (_tooltip && _tooltip.tip().hasClass('in')) {
                                        element.tooltip('hide');
                                    }
                                });
                            }
                        });
                    } else if (tooltip) {
                        element.unbind('focus.jdValidationTooltip mouseenter.jdValidationTooltip blur.jdValidationTooltip mouseleave.jdValidationTooltip');
                        element.tooltip('destroy');
                    }
                });

                // destroy
                // se escopo destruido remove eventos
                scope.$on('$destroy', function () {
                    element.unbind('change.jdValidationTooltip click.jdValidationTooltip input.jdValidationTooltip paste.jdValidationTooltip keyup.jdValidationTooltip focus.jdValidationTooltip mouseenter.jdValidationTooltip blur.jdValidationTooltip mouseleave.jdValidationTooltip');
                    element.tooltip('destroy');
                });
            }
        };
    }]);
	angular.module('jedi.layout', ['jedi.layout.datepicker',
									'jedi.layout.panel',
									'jedi.layout.modal',
									'jedi.layout.treeview',
									'jedi.layout.input',
									'jedi.layout.validationtooltip']);

}));