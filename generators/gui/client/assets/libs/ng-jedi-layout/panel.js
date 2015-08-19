'use strict';

define(['ng-jedi-utilities'], function () {

    angular.module('jedi.layout.panel', ['jedi.utilities']).constant('jedi.layout.panel.PanelConfig', {
        defaultElementClass: 'panel-body form-horizontal',
        defaultFormClass: 'form-validation',
        wrapSizeTpl: '<div class="col-lg-{{jdPanel}}"></div>',
        containerFilter: '.content-container',
        useBoxedPage: true,
        boxedPageTpl: '<div class="page"></div>',
        bodyTpl: '<section class="panel panel-default"></section>',
        headerTpl: '<div class="panel-heading">' +
        '  <strong>{{jdIcon}}<jd-i18n>{{jdTitle}}</jd-i18n></strong>' +
        '</div>',
        iconTpl: '<span class="glyphicon {{jdTitleIcon}}"></span>'
    }).directive('jdPanel', ['jedi.utilities.Utilities', 'jedi.layout.panel.PanelConfig', '$interpolate', '$compile', '$filter', function (utilities, PanelConfig, $interpolate, $compile, $filter) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
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

                var wrapper = utilities.wrapElement(element, $interpolate(PanelConfig.bodyTpl)(angular.extend({}, attrs, scope)));

                if (typeof attrs.jdToggle != 'undefined') {
                    attrs.jdTitleIcon = attrs.jdToggle.toLowerCase().trim() == 'false' ? 'glyphicon-chevron-right' : 'glyphicon-chevron-down';
                }

                // se jdTitleIcon definido vazio então fica sem icone
                if (typeof attrs.jdTitleIcon == 'undefined') {
                    attrs.jdTitleIcon = 'glyphicon-th';
                    attrs.jdIcon = $interpolate(PanelConfig.iconTpl)(angular.extend({}, attrs, scope));
                } else 
                if (attrs.jdTitleIcon.trim() !== '') {
                    attrs.jdIcon = $interpolate(PanelConfig.iconTpl)(angular.extend({}, attrs, scope));
                }

                if (attrs.jdTitle) {
                    wrapper.prepend($interpolate(PanelConfig.headerTpl)(angular.extend({}, attrs, scope)));
                }

                if (attrs.jdPanel) {
                    // define painel menor que o padrão 100%
                    wrapper = utilities.wrapElement(wrapper, $interpolate(PanelConfig.wrapSizeTpl)(angular.extend({}, attrs, scope)));
                } else
                if (PanelConfig.useBoxedPage && wrapper.parent().is(PanelConfig.containerFilter)) {
                    // cria div page caso o parent seja o container
                    wrapper = utilities.wrapElement(wrapper, $interpolate(PanelConfig.boxedPageTpl)(angular.extend({}, attrs, scope)));
                }

                var head = element.parents('.panel:first').children('.panel-heading');
                if (head.length > 0) {
                    $compile(head)(scope);
                }

                var footer = element.children('.panel-footer');
                if (footer.length > 0) {
                    element.after(footer);
                }

                var toggleElement;

                if (typeof attrs.jdToggle != 'undefined') {
                    var toggle = function toggle(panel) {
                        var $target = panel.children('.panel-heading').find('.glyphicon');
                        var panelContent = panel.children('.panel-body,.panel-footer');
                        if (panelContent.toggle().is(':visible')) {
                            $target.removeClass('glyphicon-chevron-right');
                            $target.addClass('glyphicon-chevron-down');
                        } else {
                            $target.removeClass('glyphicon-chevron-down');
                            $target.addClass('glyphicon-chevron-right');
                        }
                        if (scope.$eval(attrs.jdToggle)) {
                            scope.$eval(attrs.jdToggle + ' = value', { value: panelContent.is(':visible') });
                        }
                    };

                    toggleElement = element.parents('.panel:first').children('.panel-heading').find('*:first').addClass('toggleable').click(function (e) {
                        toggle(jQuery(e.target).parents('.panel:first'));
                        e.stopPropagation();
                        return false;
                    });

                    if (attrs.jdToggle.toLowerCase().trim() === 'false') {
                        toggle(element.parents('.panel:first'));
                    } else if (attrs.jdToggle.toLowerCase().trim() !== "") {
                        scope.$watch(attrs.jdToggle, function (newValue, oldValue) {
                            if (newValue === oldValue && typeof newValue == 'undefined') {
                                //Desconsidera a vez que o angular roda o watch antes mesmo da variável ser inicializada
                                return;
                            }

                            var panel = element.parents('.panel:first');
                            var children = panel.children('.panel-body,.panel-footer');

                            if (( !newValue && children.is(':visible'))
                                  || (newValue && !children.is(':visible'))) {
                                toggle(panel);
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
    }]);

});