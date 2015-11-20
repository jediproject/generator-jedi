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