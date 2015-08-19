'use strict';

define(['angular'], function () {

    angular.module('jedi.layout.modal', []).constant('jedi.layout.modal.ModalConfig', {
        defaultFormClass: 'form-validation',
        defaultTableClass: 'table-dynamic',
        defaultTemplateUrl: 'assets/libs/ng-jedi-layout/modal.html'
    }).directive('jdModal', ['jedi.layout.modal.ModalConfig', '$timeout', '$compile', '$filter', function (ModalConfig, $timeout, $compile, $filter) {
        return {
            restrict: "A",
            priority: 1000.1,
            compile: function compile(cElement, cAttrs, cTransclude) {
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
    }]);

});