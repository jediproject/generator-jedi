'use strict';

define(['json!version',
    'ng-jedi-dialogs',
    'restangular',
    'file-saver-saveas-js',
    'lodash'], function (version) {

        function getFileVersion(file) {
            if (version && version.files && file) {
                var f = file.split('!');
                if (f.length == 2 && version.files[f[1]]) {
                    return f[0] + '!' + version.files[f[1]];
                }
                else if (version.files[file]) {
                    return version.files[file];
                }
            }
            return file;
        }

        function applyFileVersion(files) {
            if (files) {
                var i = 0;
                for (i = 0; i < files.length; i++) {
                    if (version && version.files && version.files[files[i]]) {
                        files[i] = getFileVersion(files[i]);
                    }
                }
            }
            return files;
        }

        if (!window.jd) {
            window.jd = {};
        }

        window.jd.factory = { getFileVersion: getFileVersion };

        angular.module('jedi.factory', ['jedi.dialogs', 'restangular']);

        angular.module('jedi.factory').provider('jedi.factory.FactoryHelper', ['$injector', function ($injector) {
            var $log = angular.injector(['ng']).get('$log');
            var $rootScope = angular.injector(['ng']).get('$rootScope');

            angular.extend(window.jd.factory, {
                newController: function (controllerName, func, app) {
                    var injects = func;
                    if (!angular.isArray(func)) {
                        var serviceName = controllerName.replace('Ctrl', 'Service');

                        injects = ['$location', serviceName, 'envSettings', func];
                    }

                    var module = controllerName.split('.');
                    var submodule = module[0] + '.' + module[1] + '.' + module[2] + '.ctrls';
                    module = module[0] + '.' + module[1];

                    var init = function (app) {
                        $log.info('Load controller: ' + controllerName);

                        angular.module(submodule, [module]).controller(controllerName, injects);
                    };

                    if (app) {
                        init(app);
                    } else {
                        define(['app'], init);
                    }
                },

                newService: function (serviceName, api, actions, params, app) {
                    if (!params) {
                        params = {}
                    }

                    var module = serviceName.split('.');
                    var submodule = module[0] + '.' + module[1] + '.' + module[2] + '.ctrls';
                    module = module[0] + '.' + module[1];

                    var init = function (app) {
                        angular.module(submodule, [module]).factory(serviceName, ['$resource', function ($resource) {
                            $log.info('Load Service: ' + serviceName);
                            return $resource(api, params, actions);
                        }]);
                    };

                    if (app) {
                        init(app);
                    } else {
                        define(['app'], init);
                    }
                },

                newModal: function (name, templateUrl, controllerName, controller, options, app) {
                    var init = function () {
                        // Criando controller da modal
                        var injects = controller;
                        if (!angular.isArray(controller)) {
                            injects = ['$modalInstance', 'envSettings', controller];
                        }

                        // tratamento para complementar array de inje��o com os params
                        var func = injects[injects.length - 1]; // construtor do controller
                        var params = injects[injects.length - 2]; // penultimo argumento � a lista de parametros da modal
                        if (angular.isArray(params)) {
                            injects = injects.slice(0, injects.length - 2); // pega 
                            injects = injects.concat(params);
                            injects.push(func);
                        } else {
                            params = undefined;
                        }

                        var module = controllerName.split('.');
                        var submoduleCrtl = module[0] + '.' + module[1] + '.' + module[2] + '.ctrls';
                        var submoduleModal = module[0] + '.' + module[1] + '.' + module[2] + '.modals';
                        module = module[0] + '.' + module[1];

                        $log.info('Load modal controller: ' + controllerName);

                        angular.module(submoduleCrtl, [module]).controller(controllerName, injects);

                        // Criando diretiva da modal
                        var _scope = {
                            onSelect: '=',
                            onCancel: '='
                        };

                        if (params) {
                            angular.forEach(params, function (param) {
                                _scope[param] = '=';
                            });
                        }

                        $log.info('Load modal directive: ' + name);

                        angular.module(submoduleModal, [module]).directive(name, ['jedi.dialogs.ModalHelper', function (modalHelper) {
                            return {
                                restrict: 'A',
                                scope: _scope,
                                link: function (scope, element, attrs) {
                                    var _openOn = 'click';
                                    if (attrs[name] && attrs[name] != '') {
                                        _openOn = attrs[name];
                                    }
                                    _openOn += '.jdmodal';

                                    var resolver = undefined;

                                    if (params) {
                                        resolver = {};
                                        angular.forEach(params, function (param) {
                                            resolver[param] = function () {
                                                return scope.$eval(param);
                                            };
                                        });
                                    }

                                    element.on(_openOn, function (e) {
                                        var _onSelect = undefined;
                                        if (scope.onSelect) {
                                            _onSelect = function () {
                                                var args = [];
                                                if (arguments && arguments.length > 0) {
                                                    angular.forEach(arguments, function (argument) {
                                                        args.push(argument);
                                                    });
                                                }
                                                // adiciona evento que disparou a modal
                                                args.push(e);
                                                scope.onSelect.apply(scope.onSelect, args);
                                            };
                                        }
                                        modalHelper.open(templateUrl, controllerName, resolver, _onSelect, scope.onCancel, options);
                                    });

                                    scope.$on('$destroy', function () {
                                        element.unbind(_openOn);
                                    });
                                }
                            }
                        }]);
                    };

                    if (app) {
                        init(app);
                    } else {
                        define(['app'], init);
                    }
                },

                newDirective: function (name, injects, app) {
                    var init = function () {
                        angular.module('app.directives', ['app']).directive(name, injects);
                    };

                    if (app) {
                        init(app);
                    } else {
                        define(['app'], init);
                    }
                },

                newFilter: function (name, injects, app) {
                    var init = function () {
                        angular.module('app.filters', ['app']).filter(name, injects);
                    };

                    if (app) {
                        init(app);
                    } else {
                        define(['app'], init);
                    }
                },

                newModule: function (module, options) {
                    var envJsPath = options && angular.isDefined(options.envJsPath) ? options.envJsPath : 'json!app/{module}/env/{module}-env.json';
                    var useRestangular = options && angular.isDefined(options.useRestangular) ? options.useRestangular : true;
                    var envSettingsName = options && options.envSettingsName ? options.envSettingsName : 'envSettings';
                    var externalDepsJs = options && options.externalDeps ? options.externalDeps : undefined;
                    var depsModules = options && options.angularModules ? options.angularModules : undefined;
                    var internalDepsJs = options && options.internalDeps ? options.internalDeps : undefined;
                    var funcConfig = options && options.config ? options.config : undefined;
                    var funcRun = options && options.run ? options.run : undefined;

                    var _envJsPath;
                    if (envJsPath) {
                        _envJsPath = envJsPath.replace(/{module}/g, module);
                    }

                    var _externalDepsJs = ['app'];
                    if (externalDepsJs) {
                        if (!angular.isArray(externalDepsJs)) {
                            externalDepsJs = [externalDepsJs];
                        }
                        _externalDepsJs = externalDepsJs.concat(_externalDepsJs);
                    }

                    define(applyFileVersion(_externalDepsJs), function (app) {
                        var _depsModules = ['app'];
                        if (depsModules) {
                            _depsModules = depsModules.concat(_depsModules);
                        }

                        var _module = angular.module('app.' + module, _depsModules);

                        // function para complementar cria��o do modulo, a ser chamado dentro do require env, ou fora, caso nao haja env
                        var _createModule = function (moduleEnvSettings) {
                            if (funcConfig) {
                                _module.config(funcConfig);
                            }

                            if (funcRun) {
                                _module.run(funcRun);
                            }

                            // FIXME Viana: excuta config, run e demais fn do m�dulo
                            // registro pelo newModule n�o garante execu��o do config e run dos m�dulos, trecho abaixo for�a execu��o correta de cada modulo
                            var i, ii, invokeQueue;
                            for (invokeQueue = _module._invokeQueue, i = 0, ii = invokeQueue.length; i < ii; i++) {
                                var invokeArgs = invokeQueue[i];
                                if (invokeArgs[2].length > 0 && invokeArgs[2][0].length > 0) {
                                    var provider = $injector.get(invokeArgs[0]);
                                    // config
                                    provider[invokeArgs[1]].apply(provider, invokeArgs[2]);
                                }
                            }
                            angular.forEach(_module._runBlocks, function (fn) {
                                // run
                                if (fn.length > 0) {
                                    $injector.invoke(fn);
                                }
                            });

                            var hasInternalDeps = false;
                            if (internalDepsJs) {
                                if (!angular.isArray(internalDepsJs)) {
                                    internalDepsJs = [internalDepsJs];
                                }
                                if (internalDepsJs.length > 0) {
                                    hasInternalDeps = true;
                                    // carrega submodulos internos do sistema
                                    require(applyFileVersion(internalDepsJs), function () {
                                        $log.info('Module loaded: ' + module);
                                        // emit event module loaded
                                        $rootScope.$broadcast('factory:moduleloaded', module, moduleEnvSettings, arguments);
                                    });
                                }
                            }

                            if (!hasInternalDeps) {
                                $log.info('Module loaded: ' + module);
                                // emit event module loaded
                                $rootScope.$broadcast('factory:moduleloaded', module, moduleEnvSettings);
                            }
                        }

                        if (!envJsPath) {
                            // se n�o utilizar env.json, completa carregamento do modulo
                            _createModule();
                        } else {
                            // carrega env definido e depois complementa carregamento do m�dulo
                            require([getFileVersion(_envJsPath)], function (moduleEnvSettings) {
                                // atribui env do m�dulo no envSettings global
                                var envSettings = $injector.get(envSettingsName);
                                envSettings[module] = moduleEnvSettings;

                                // carrega restangular do modulo, caso haja url base
                                if (useRestangular && moduleEnvSettings.apiUrlBase) {
                                    angular.module('app.' + module).factory(module + 'RestService', ['Restangular', function (Restangular) {
                                        return Restangular.withConfig(function (RestangularConfigurer) {
                                            RestangularConfigurer.setBaseUrl(moduleEnvSettings.apiUrlBase);
                                            RestangularConfigurer.onElemRestangularized = function (elem, isCollection, route, Restangular) {
                                                elem.copy = function (_elem) {
                                                    // cria m�todo copy na instancia do service Restangular para adicionar rota base
                                                    //  >> metodo clone n�o faz isso, provavelmente bug do Restangular
                                                    var _newElem = Restangular.copy(_elem);
                                                    _newElem.route = route;
                                                    return _newElem;
                                                };

                                                //ToDo: Tanato Melhorar os m�todos de download, corrigir para mostrar o nome do arquivo correto.
                                                elem.getDownload = function (queryParams) {
                                                    elem.withHttpConfig({ responseType: 'arraybuffer' }).get(queryParams).then(function (data) {
                                                        var blob = new Blob([data], { type: data.headers["content-type"] });

                                                        var contentDisposition = data.headers["content-disposition"];
                                                        var filename = contentDisposition.substring((contentDisposition.indexOf('filename=') + 9));

                                                        saveAs(blob, filename);
                                                    });
                                                };
                                                elem.postDownload = function (bodyContent, queryParams) {
                                                    elem.withHttpConfig({ responseType: 'arraybuffer' }).post(bodyContent, queryParams).then(function (data) {
                                                        var blob = new Blob([data], { type: data.headers["content-type"] });

                                                        var contentDisposition = data.headers["content-disposition"];
                                                        var filename = contentDisposition.substring((contentDisposition.indexOf('filename=') + 9));

                                                        saveAs(blob, filename);
                                                    });
                                                };
                                                return elem;
                                            };
                                        });
                                    }]);
                                }

                                // completa carregamento do modulo
                                _createModule(moduleEnvSettings);
                            });
                        }
                    });
                },

                loadModules: function (urlOrModules, options, _onloadmodule, _onfinish) {
                    var ignoredModules;
                    var appJsPath;
                    var onloadmodule;
                    var onfinish;
                    var defAppJsPath = 'app/{module}/{module}-app.js';

                    if (typeof options == "function") {
                        if (typeof _onloadmodule == "function") {
                            onloadmodule = options;
                            onfinish = _onloadmodule;
                        } else {
                            _onfinish = options;
                        }
                        appJsPath = defAppJsPath;
                    } else
                        if (options && typeof options.push == "function") {
                            ignoredModules = options;
                            appJsPath = defAppJsPath;
                            if (typeof _onloadmodule == "function") {
                                if (typeof _onfinish == "function") {
                                    onfinish = _onfinish;
                                    onloadmodule = _onloadmodule;
                                } else {
                                    onfinish = _onloadmodule;
                                }
                            }
                        } else {
                            ignoredModules = options ? options.ignoredModules : undefined;
                            appJsPath = options && options.appJsPath ? options.appJsPath : defAppJsPath;
                            onloadmodule = options.onloadmodule;
                            onfinish = options.onfinish;
                        }

                    var _loadModules = function (modules) {
                        var size = modules.length;
                        var count = 0; // atd modulos carregados via require

                        var modulesLoaded = [];
                        $rootScope.$on('factory:moduleloaded', function (e, moduleloaded, moduleEnvSettings) {
                            if (onloadmodule) {
                                // se informado, chama evento de fim carregamento do modulo
                                onloadmodule(moduleloaded, moduleEnvSettings);
                            }

                            if (!_.any(modulesLoaded, function (item) { return item == moduleloaded })) {
                                modulesLoaded.push(moduleloaded);
                            }

                            // ap�s carregar todos os m�dulos dispara evento
                            if (modulesLoaded.length == count && onfinish) {
                                onfinish(modules);
                            }
                        });

                        // pra cada modulo, carrega o env e app do mesmo
                        angular.forEach(modules, function (module) {
                            // verifica se modulo n�o est� na lista de ignorados no load
                            if (!(ignoredModules && _.any(ignoredModules, function (item) { return item == module }))) {
                                count++;
                                $log.info('Dispatch Load module: ' + module);
                                var _appJsPath = appJsPath.replace(/{module}/g, module);
                                // carrega app
                                require([getFileVersion(_appJsPath)]);
                            }
                        });
                    };

                    if (typeof urlOrModules.push == "function") {
                        _loadModules(urlOrModules);
                    } else {
                        require([getFileVersion(urlOrModules)], _loadModules);
                    }
                }
            });

            angular.extend(this, window.factory);

            this.$get = [function () {
                return angular.extend({}, window.factory);
            }];
        }]);

        return window.factory;
    });