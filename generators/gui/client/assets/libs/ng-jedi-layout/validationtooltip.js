'use strict';

define(['angular', 'bootstrap'], function () {

    angular.module('jedi.layout.validationtooltip', []).constant('jedi.layout.validationtooltip.ValidationTooltipConfig', {
        messages: {
            'required': 'Preenchimento obrigatório.',
            'minlength': 'Informe pelo menos {{minLength}} caracteres.',
            'maxlength': 'Informe até {{maxLength}} caracteres.',
            'pattern': 'Valor preenchido é inválido.',
            'equal': 'Valor informado não é igual ao campo anterior.',
            'email': 'Email informado é inválido.',
            'url': 'Url informada é inválida.',
            'number': 'Informe um número válido.',
            'datepicker': 'Informe uma data válida.',
            'date': 'Informe uma data válida.',
            'min': 'Informe um número a partir de {{min}}.',
            'max': 'Informe um número até {{max}}.',
            'cpf': 'CPF informado é inválido.',
            'cnpj': 'CNPJ informado é inválido.',
            'default': 'Conteúdo do campo é inválido.'
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

});