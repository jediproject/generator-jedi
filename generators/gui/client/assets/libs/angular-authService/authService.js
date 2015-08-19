// author: Fábio Henrique da Silva Viana <fabiohsv@ciandt.com> 
// version: 1.0.0
// license: MIT
// homepage: https://github.com/fabioviana/angular-authService

'use strict';

angular.module("authService", []).provider('authService', ['$injector', function ($injector) {
    var _authSettings = {
        storageKey: 'authorizationData',
        clientId: 'ngAuthApp'/*,
        signInUrl: '/auth',
        signOutUrl: '/auth/signout',
        validateTokenUrl: '/auth/validatetoken'*/
    };

    var _storageService = {
        get: function (id) {
            return JSON.parse(localStorage.getItem(id))
        },
        set: function (id, obj) {
            return localStorage.setItem(id, JSON.stringify(obj))
        },
        remove: function (id) {
            return localStorage.removeItem(id)
        }
    };

    var _defaultIdentity = {
        isAuth: false,
        username: "",
        useRefreshTokens: false,
        roles: [],
        hasRoles: function (roles) {
            if (this.isAuth) {
                var attributes = roles.split(",");
                for (var i in attributes) {
                    if (_.contains(this.roles, attributes[i])) {
                        return true;
                    }

                }
            }
            return false;
        }
    };

    var _identity = angular.copy(_defaultIdentity);

    var _resetAuthData = function () {
        _storageService.remove(_authSettings.storageKey);
        _identity = angular.copy(_defaultIdentity);
    };

    var _tokenHasExpired = function (expiry) {
        //var now = new Date().getTime();
        //return expiry && expiry < now;
        // TODO Viana: acertar expiry vindo do response, não está trazendo o tempo de expiração correto
        return false;
    };

    this.config = function (value) {
        _authSettings = value;
    };

    this.$get = ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {
        return {
            initialize: function () {
                var authData = _storageService.get(_authSettings.storageKey);
                if (authData && authData.identity) {
                    if (_tokenHasExpired(authData.identity.expires)) {
                        $rootScope.$broadcast('auth:session-expired');
                    } else {

                        _identity = angular.copy(_defaultIdentity);
                        _identity = angular.extend(_identity, authData.identity);

                        // validate token api
                        if (_authSettings.validateTokenUrl) {
                            var deferred = $q.defer();

                            $http.post(_authSettings.authUrlBase + _authSettings.validateTokenUrl, undefined, { bypassExceptionInterceptor: true }).success(function (response) {
                                deferred.resolve(response);
                                $rootScope.$broadcast('auth:validation-success', _identity);
                            }).error(function (err, status, headers, config) {
                                _resetAuthData();
                                deferred.reject(err);
                                $rootScope.$broadcast('auth:validation-error', err, status, config);
                            });
                            return deferred.promise;
                        } else {
                            $rootScope.$broadcast('auth:validation-success', _identity);
                        }
                    }
                } else {
                    $rootScope.$broadcast('auth:invalid');
                }
            },

            signIn: function (loginData) {

                var data = { grant_type: 'password' };
                data = angular.extend(data, loginData);

                if (loginData.useRefreshTokens) {
                    data.client_id = _authSettings.clientId;
                }

                var deferred = $q.defer();

                $http.post(_authSettings.authUrlBase + _authSettings.signInUrl, jQuery.param(data), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, bypassExceptionInterceptor: true }).success(function (response) {

                    _identity.isAuth = true;
                    _identity.username = loginData.username;
                    _identity.expires = new Date().getTime() + response.expires_in;
                    _identity.roles = response.roles ? response.roles.split(',') : [];
                    _identity.useRefreshTokens = loginData.useRefreshTokens;

                    // custom identity object
                    if (_authSettings.handleTokenResponse) {
                        _identity = _authSettings.handleTokenResponse(response, _identity);
                    }

                    if (loginData.useRefreshTokens) {
                        _storageService.set(_authSettings.storageKey, { token: response.access_token, identity: _identity, refreshToken: response.refresh_token, useRefreshTokens: true });
                    } else {
                        _storageService.set(_authSettings.storageKey, { token: response.access_token, identity: _identity, refreshToken: "", useRefreshTokens: false });
                    }

                    deferred.resolve(response);

                    $rootScope.$broadcast('auth:login-success', _identity);

                }).error(function (err, status, headers, config) {
                    _resetAuthData();
                    deferred.reject(err);

                    $rootScope.$broadcast('auth:login-error', err, status, config, loginData);
                });

                return deferred.promise;
            },

            signOut: function (cause) {
                // signout api
                var deferred = $q.defer();

                $http.delete(_authSettings.authUrlBase + _authSettings.signOutUrl, { bypassExceptionInterceptor: true }).success(function (response, status, headers, config) {
                    // limpa dados
                    _resetAuthData();

                    deferred.resolve(response);
                    $rootScope.$broadcast('auth:logout-success', response, status, config, cause);
                }).error(function (err, status, headers, config) {
                    // limpa dados
                    _resetAuthData();

                    deferred.reject(err);
                    $rootScope.$broadcast('auth:logout-error', err, status, config, cause);
                });

                return deferred.promise;
            },

            refreshToken: function () {
                var deferred = $q.defer();

                var authData = _storageService.get(_authSettings.storageKey);

                if (authData) {

                    if (authData.useRefreshTokens) {

                        var data = "grant_type=refresh_token&refresh_token=" + authData.refreshToken + "&client_id=" + _authSettings.clientId;

                        _storageService.remove(_authSettings.storageKey);

                        $http.post(_authSettings.authUrlBase + _authSettings.signInUrl, data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, bypassExceptionInterceptor: true }).success(function (response) {

                            _identity.isAuth = true;
                            _identity.expires = new Date().getTime() + response.expires_in;
                            _identity.roles = response.roles ? response.roles.split(',') : [];

                            // custom identity object
                            if (_authSettings.handleTokenResponse) {
                                _identity = _authSettings.handleTokenResponse(_identity);
                            }

                            _storageService.set(_authSettings.storageKey, { token: response.access_token, identity: _identity, refreshToken: response.refresh_token, useRefreshTokens: true });

                            $rootScope.$broadcast('auth:refresh-success');

                            deferred.resolve(response);

                        }).error(function (err, status, headers, config) {
                            // limpa dados
                            _resetAuthData();

                            deferred.reject(err);
                            $rootScope.$broadcast('auth:refresh-error', err, status, config);
                        });
                    }
                }

                return deferred.promise;
            },

            getToken: function () {
                var authData = _storageService.get(_authSettings.storageKey);
                if (authData) {
                    return authData.token;
                } else {
                    return undefined;
                }
            },

            useRefreshTokens: function () {
                var authData = _storageService.get(_authSettings.storageKey);
                if (authData) {
                    return authData.useRefreshTokens;
                } else {
                    return false;
                }
            },

            hasRoles: function (roles) {
                return _identity.hasRoles(roles);
            },

            isAuthenticated: function (roles) {
                return _identity.isAuth;
            },

            _resetAuthData: _resetAuthData
        }
    }];

}]).factory('authInterceptorService', ['$q', '$injector', '$location', '$rootScope', function ($q, $injector, $location, $rootScope) {

    var authInterceptorServiceFactory = {};

    var _request = function (config) {

        config.headers = config.headers || {};

        var authService = $injector.get('authService');
        var token = authService.getToken();
        if (token) {
            config.headers.Authorization = 'Bearer ' + token;
        }

        return config;
    }

    var _responseError = function (rejection) {
        if (rejection.status === 401 && !rejection.config.bypassExceptionInterceptor) {
            var authService = $injector.get('authService');
            if (authService.useRefreshTokens()) {
                authService.refreshToken();
            } else {
                // limpa dados de autenticação
                authService._resetAuthData();

                // emite evento de sessão expirada
                $rootScope.$broadcast('auth:session-expired', rejection.data, rejection.status, rejection.config);
            }
        }
        return $q.reject(rejection);
    }

    authInterceptorServiceFactory.request = _request;
    authInterceptorServiceFactory.responseError = _responseError;

    return authInterceptorServiceFactory;

}]).filter('hasRoles', ['authService', function (authService) {
    return function (arr, roles) {

        if (!authService.hasRoles(roles)) {
            return [];
        }

        return arr;
    };
}]).filter('isAuthenticated', ['authService', function (authService) {
    return function (arr) {

        if (!authService.isAuthenticated) {
            return [];
        }

        return arr;
    };
}]).directive('asRolesToShow', ['authService', '$interpolate', function (authService, $interpolate) {
    return {
        restrict: 'A',
        link: function ($scope, element) {
            var asRolesToShow = element.attr('as-roles-to-show');

            $scope.$watch(function () {
                return authService.hasRoles($interpolate(asRolesToShow)($scope));
            },
            function (value) {
                var elem;

                if (element.is(':button,a')) {
                    elem = element;
                } else
                if (element.is(':input')) {
                    elem = element.parents('.form-group:first,.input-group:first');
                } else
                if (element.is('.panel-body')) {
                    elem = element.parents('.panel:first');
                } else
                if (element.is('td')) {
                    // se coluna de grid, adiciona todos os tds da coluna em questão
                    var index = element.index() + 1;
                    elem = element.parents('table:first').find('td:nth-child(' + index + '),th:nth-child(' + index + ')').add(element);
                }

                if (!elem || elem.length == 0) {
                    elem = element;
                }

                if (!value) {
                    elem.hide();
                } else {
                    elem.show();
                }
            });
        }
    }
}]).directive('asRolesToActive', ['authService', '$interpolate', function (authService, $interpolate) {
    return {
        restrict: 'A',
        link: function ($scope, element) {
            var asRolesToActive = element.attr('as-roles-to-active');

            $scope.$watch(function () {
                return authService.hasRoles($interpolate(asRolesToActive)($scope));
            },
            function (value) {
                var elem;

                if (element.is(':button,a,:input')) {
                    elem = element;
                } else
                if (element.is('.panel-body') || element.is('td')) {
                    elem = element.find(':button,a,:input');
                }

                if (!elem || elem.length == 0) {
                    elem = element;
                }

                if (!value) {
                    // se for coluna, pega botões ou links
                    angular.forEach(elem, function (item) {
                        var $item = $(item);
                        if ($item.is('a') || $item.is(':button')) {
                            $item.attr('disabled', true);
                        } else {
                            $item.attr('readonly', true);
                        }
                        var events = $._data($item[0]).events;
                        if (events && events.click) {
                            $._data($item[0], 'as.click', events.click.slice(0));
                        }
                    });

                    elem.unbind('click').click(function (e) {
                        e.stopPropagation();
                        return false;
                    });
                } else {
                    elem.removeAttr('readonly');
                    elem.removeAttr('disabled');

                    angular.forEach(elem, function (item) {
                        var $item = $(item);
                        var clicks = $._data($item[0], 'as.click');
                        if (clicks) {
                            angular.forEach(clicks, function (click) {
                                $item.unbind('click').click(click);
                            });
                        }
                    });
                }
            });
        }
    }
}]).config(['$httpProvider', function ($httpProvider) {
    // register authInterceptor
    $httpProvider.interceptors.push('authInterceptorService');

    angular.forEach(['get', 'post', 'put', 'patch', 'delete'], function (method) {
        if (!$httpProvider.defaults.headers[method]) {
            $httpProvider.defaults.headers[method] = {};
        }
        $httpProvider.defaults.headers[method]['If-Modified-Since'] = 'Thu, 01 Jan 1970 00:00:00 GMT';
        delete $httpProvider.defaults.headers[method]['X-Requested-With'];
    });

}]);