"use strict";

define(['angular', 'angular-dynamic-locale'], function () {
    var tmhDynamicLocaleProviderRef;

    angular.module("jedi.i18n", ['jedi.utilities', 'tmh.dynamicLocale']).constant('jedi.i18n.LocalizeConfig', {
        defaultLanguage: 'pt',
        supportedLanguage: ['pt', 'en'],
        localePath: 'assets/libs/angular-i18n/angular-locale_{{locale}}.js'
    }).factory("jedi.i18n.Localize", ['jedi.utilities.Utilities', '$rootScope', 'jedi.i18n.LocalizeConfig', '$log', 'tmhDynamicLocale', function (utilities, $rootScope, LocalizeConfig, $log, tmhDynamicLocale) {
        var userLang;
        try {
            userLang = JSON.parse(localStorage.getItem('i18n_lang'));
        } catch (e) { }

        if (!userLang) {
            userLang = navigator.language || navigator.userLanguage;
        }

        var language = LocalizeConfig.defaultLanguage;
        if (userLang) {
            language = userLang.toLowerCase().split("-")[0];
            // se linguagem não for suportada, considera default
            if (!_.find(LocalizeConfig.supportedLanguage, function (item) { return item == language; })) {
                language = LocalizeConfig.defaultLanguage;
            }
        }

        $log.info('Lang setted to: ' + language);

        var resources = [];
        var dictionary = {};
        var regexDictionary = {};

        var onfinishLoadResources = function (lang) {
            $rootScope.$broadcast("jedi.i18n.LanguageChanged", lang);
        };

        var onfinishChangeLanguage = function (lang, onfinish) {
            var event;
            event = $rootScope.$on('$localeChangeSuccess', function (evt, lang) {
                $log.debug('ngLocale_' + lang + ' loaded');

                // atribui lang escolhida
                if (language != lang) {
                    language = lang;
                    $log.debug('Language changed to: ' + lang);
                }

                // atualiza cache com lang escolhida
                utilities.setLocalStorage('i18n_lang', lang);

                if (moment) {
                    // atribui ao moment a linguagem corrente
                    moment.locale(lang);
                }

                if (onfinish) {
                    onfinish(lang);
                }
                // remove listener
                if (event) {
                    event();
                }
            });

            // FIXME viana: problemas para carregar script quando se usa de-para de versão com cache bust
            if (jd && jd.factory && jd.factory.getFileVersion) {
                tmhDynamicLocaleProviderRef.localeLocationPattern(jd.factory.getFileVersion(LocalizeConfig.localePath.replace(/{{locale}}/g, lang)));
            }

            tmhDynamicLocale.set(lang);
        };

        var changeLanguage = function (lang) {
            if (language != lang) {
                loadResources(lang, resources, function (lang) {
                    onfinishChangeLanguage(lang, function () {
                        onfinishLoadResources(lang);
                    });
                });
            } else {
                onfinishChangeLanguage(lang);
            }
        };

        changeLanguage(language);

        var loadResources = function (lang, res, onfinish) {
            if (lang != LocalizeConfig.defaultLanguage) {
                var _resources = [];
                angular.forEach(res, function (resource) {
                    _resources.push('json!' + (jd && jd.factory ? jd.factory.getFileVersion(resource.replace(/{lang}/g, lang)) : resource.replace(/{lang}/g, lang)));
                });

                require(_resources, function () {
                    $log.debug('Resources loaded:');
                    $log.debug(_resources);
                    // se linguagem foi alterada, reseta dictionaries
                    if (lang != language) {
                        dictionary = {};
                        regexDictionary = {};
                    }
                    // pra cada resources retornado adiciona ao dictionary
                    angular.forEach(arguments, function (data) {
                        if (data) {
                            if (data.resources || data.regexResources) {
                                if (data.resources) {
                                    dictionary = angular.extend(dictionary, data.resources);
                                }
                                if (data.regexResources) {
                                    regexDictionary = angular.extend(regexDictionary, data.regexResources);
                                }
                            } else {
                                dictionary = angular.extend(dictionary, data);
                            }
                        }
                    });
                    onfinish(lang);
                });
            } else {
                dictionary = {};
                regexDictionary = {};
                onfinish(lang);
            }
        };

        return {
            addResource: function (resource) {
                resources.push(resource);
                // se linguagem atual for diferente da default, carrega resource
                if (language != LocalizeConfig.defaultLanguage) {
                    loadResources(language, [resource], onfinishLoadResources);
                }
            },

            setLanguage: function (value) {
                value = value.toLowerCase().split("-")[0];
                // se linguagem atual for diferente da linguagem informada, carrega resources
                if (language != value) {
                    changeLanguage(value);
                }
            },

            getLanguage: function () {
                return language;
            },

            getDefaultLanguage: function () {
                return LocalizeConfig.defaultLanguage;
            },

            get: function (value) {
                // se tem value e linguagem for diferente da default, então traduz
                // se for linguagem default nao precisa traduzir
                if (value && language != LocalizeConfig.defaultLanguage) {
                    if (dictionary && dictionary[value.toLowerCase()]) {
                        return dictionary[value.toLowerCase()];
                    } else
                        if (regexDictionary) {
                            // busca usando regex
                            // value: Deseja excluir o modulo Controle de Acesso?
                            // regex: Deseja excluir o modulo ([^(?)]+)\?
                            // tradução: Would you like to remove the module $1?
                            // estratégia: loop em todas as chaves fazendo match com o value, o que der match retorna fazendo replace dos matches encontrados
                            for (var key in regexDictionary) {
                                var reg = new RegExp(key, 'gi');
                                var m = value.match(reg);
                                if (m && m.length > 0) {
                                    var translate = regexDictionary[key];
                                    return value.replace(reg, translate);
                                }
                            }
                        }
                }
                return value;
            }
        }
    }]).directive("jdI18n", ["jedi.i18n.Localize", '$interpolate', function (localize, $interpolate) {
        var i18nDirective;
        return i18nDirective = {
            restrict: "EA",
            update: function (scope, ele, attrs) {
                // altera body do elemento caso não sejam tags html, se for apenas texto
                if (ele.html().trim() == ele.text().trim()) {
                    var text = ele.text().trim();
                    if (ele.attr("i18n-body")) {
                        ele.text(localize.get($interpolate(ele.attr("i18n-body"))(scope)));
                    } else if (text) {
                        ele.attr("i18n-body", text);
                        ele.text(localize.get($interpolate(text)(scope)));
                    }
                }

                // altera placeholder
                if (attrs.placeholder) {
                    if (ele.attr("i18n-placeholder")) {
                        ele.attr("placeholder", localize.get($interpolate(ele.attr("i18n-placeholder"))(scope)));
                    } else {
                        ele.attr("i18n-placeholder", attrs.placeholder);
                        ele.attr("placeholder", localize.get($interpolate(attrs.placeholder)(scope)));
                    }
                }

                // altera title
                if (attrs.title) {
                    if (ele.attr("i18n-title")) {
                        ele.attr("title", localize.get($interpolate(ele.attr("i18n-title"))(scope)));
                    } else {
                        ele.attr("i18n-title", attrs.title);
                        ele.attr("title", localize.get($interpolate(attrs.title)(scope)));
                    }
                }

                // altera alt
                if (attrs.alt) {
                    if (ele.attr("i18n-alt")) {
                        ele.attr("alt", localize.get($interpolate(ele.attr("i18n-alt"))(scope)));
                    } else {
                        ele.attr("i18n-alt", attrs.alt);
                        ele.attr("alt", localize.get($interpolate(attrs.alt)(scope)));
                    }
                }
            },
            link: function (scope, ele, attrs) {
                var observe = function (value) {
                    i18nDirective.update(scope, ele, attrs);
                };

                if (ele.html().trim() == ele.text().trim()) {
                    i18nDirective.update(scope, ele, attrs);
                    scope.$watch(function(){
                        if (ele.attr("i18n-body")) {
                            return $interpolate(ele.attr("i18n-body"))(scope);
                        } else {
                            return undefined;
                        }
                    }, observe);
                }

                if (attrs.title) {
                    attrs.$observe('title', observe);
                }

                if (attrs.alt) {
                    attrs.$observe('alt', observe);
                }

                if (attrs.placeholder) {
                    attrs.$observe('placeholder', observe);
                }

                scope.$on("jedi.i18n.LanguageChanged", observe);
            }
        };
    }]).filter('jdI18n', ['jedi.i18n.Localize', function (localize) {
        return function (value) {
            return localize.get(value);
        }
    }]).config(['tmhDynamicLocaleProvider', 'jedi.i18n.LocalizeConfig', function (tmhDynamicLocaleProvider, LocalizeConfig) {
        tmhDynamicLocaleProviderRef = tmhDynamicLocaleProvider;
        tmhDynamicLocaleProvider.localeLocationPattern(LocalizeConfig.localePath);
    }]);
});