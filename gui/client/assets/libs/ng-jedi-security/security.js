'use strict';

(function (factory) {
    if (typeof define === 'function') {
        define(['cryptojslib', 'angular'], factory);
    } else {
        if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports){
            module.exports = 'jedi.security';
            require('cryptojslib');
        }
        return factory();
    }
}(function() {

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

	var _getAuthSettings; // function será definido abaixo

	var _getAuthData = function() {
		return _storageService.get(_getAuthSettings().storageKey);
	};

	var _resetAuthData; // function será definido abaixo

	angular.module("jedi.security", []).provider('jedi.security.SecurityService', ['$injector', function ($injector) {
		var _authSettings = {
			resolveRoles: function(response) {
				return response.roles ? response.roles.split(',') : [];
			},
			storageKey: 'jediSecurityData',
			clientId: 'jediSecurity'/*,
			signInUrl: '/auth',
			signOutUrl: '/auth/signout',
			validateTokenUrl: '/auth/validatetoken',
			refreshTokenUrl: '/auth'*/
		};

		_getAuthSettings = function () {
	    	return _authSettings;
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

		_resetAuthData = function () {
			_storageService.remove(_authSettings.storageKey);
			_identity = angular.copy(_defaultIdentity);
		};

		var _setIdentity = function (response) {
			_identity.isAuth = true;
			if (response.validation) {
				_identity.validation = response.validation;
			}

			if (response.expires_in) {
				// TODO tratar adequadamente
				_identity.expires = response.expires_in;				
			}

			if (_authSettings.resolveRoles) {
				_identity.roles = _authSettings.resolveRoles(response);
			}

			// custom identity object
			if (_authSettings.onCreateIdentity) {
				_identity = _authSettings.onCreateIdentity(response, _identity);
			}

			if (_identity.useRefreshTokens) {
				_storageService.set(_authSettings.storageKey, { token: response.access_token, identity: _identity, refreshToken: response.refresh_token, useRefreshTokens: true });
			} else {
				_storageService.set(_authSettings.storageKey, { token: response.access_token, identity: _identity, refreshToken: "", useRefreshTokens: false });
			}
		}

		this.config = function (value) {
			angular.extend(_authSettings, value);
		};

		this.$get = ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {
			return {
				initialize: function () {
					var authData = _storageService.get(_authSettings.storageKey);
					if (authData && authData.identity) {

						_identity = angular.extend(angular.copy(_defaultIdentity), authData.identity);

						// validate token api
						if (_authSettings.validateTokenUrl) {
							var deferred = $q.defer();

							$http.post(_authSettings.authUrlBase + _authSettings.validateTokenUrl, undefined, { bypassExceptionInterceptor: true }).success(function (response) {
								_setIdentity(response);

								deferred.resolve(response);
								$rootScope.$broadcast('jedi.security:validation-success', _identity);
							}).error(function (err, status, headers, config) {
								_resetAuthData();
								deferred.reject(err);
								$rootScope.$broadcast('jedi.security:validation-error', err, status, config);
							});
							return deferred.promise;
						} else {
							$rootScope.$broadcast('jedi.security:validation-success', _identity);
						}
					} else {
						$rootScope.$broadcast('jedi.security:invalid');
					}
				},

				signUp: function (loginData) {
					var deferred = $q.defer();
					$http.post(_authSettings.authUrlBase + _authSettings.signUpUrl, loginData, { bypassExceptionInterceptor: true }).success(deferred.resolve).error(deferred.reject);
					return deferred.promise;
				},

				signIn: function (loginData) {

					var data = { grant_type: 'password' };
					data = angular.extend(data, loginData);
					data.client_id = _authSettings.clientId;

					var deferred = $q.defer();

					$http.post(_authSettings.authUrlBase + _authSettings.signInUrl, jQuery.param(data), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, bypassExceptionInterceptor: true }).success(function (response) {

						_setIdentity(response);

						deferred.resolve(response);

						$rootScope.$broadcast('jedi.security:login-success', _identity);

					}).error(function (err, status, headers, config) {

						_resetAuthData();

						deferred.reject(err);

						$rootScope.$broadcast('jedi.security:login-error', err, status, config, loginData);

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
						$rootScope.$broadcast('jedi.security:logout-success', response, status, config, cause);
					}).error(function (err, status, headers, config) {
						// limpa dados
						_resetAuthData();

						deferred.reject(err);
						$rootScope.$broadcast('jedi.security:logout-error', err, status, config, cause);
					});

					return deferred.promise;
				},

				refreshToken: function () {
					var deferred = $q.defer();

					var authData = _storageService.get(_authSettings.storageKey);

					if (authData) {

						if (authData.useRefreshTokens) {
							
							var data = { grant_type: 'refresh_token' };
							data.client_id = _authSettings.clientId;
							data.refreshToken = authData.token;
							
							_storageService.remove(_authSettings.storageKey);

							$http.post(_authSettings.authUrlBase + _authSettings.refreshTokenUrl, data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, bypassExceptionInterceptor: true }).success(function (response) {
	
								_identity.useRefreshTokens = true;
								_setIdentity(response);

								$rootScope.$broadcast('jedi.security:refresh-success');

								deferred.resolve(response);

							}).error(function (err, status, headers, config) {
								
								// limpa dados
								_resetAuthData();

								deferred.reject(err);
								$rootScope.$broadcast('jedi.security:refresh-error', err, status, config);
								
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

				hasRoles: function (roles) {
					return _identity.hasRoles(roles);
				},

				isAuthenticated: function (roles) {
					return _identity.isAuth;
				}
			};
		}];
	}]).factory('jedi.security.SecurityInterceptor', ['$q', '$injector', '$location', '$rootScope', function ($q, $injector, $location, $rootScope) {

		var $log = angular.injector(['ng']).get('$log');

		var authInterceptorServiceFactory = {};

		var _request = function (config) {

			config.headers = config.headers || {};

			var authService = $injector.get('jedi.security.SecurityService');
			var token = authService.getToken();
			
			if (token) {
				var authData = _getAuthData();
				
				if(new Date().getTime() > new Date().getTime() + ((authData.identity.expires * 0.75) * 1000)){
					authService.refreshToken();		
					$log.info('Refreshing token');
				}				
				
				var settings = _getAuthSettings();
				var seconds = new Date().getTime();
				config.headers.Authorization = 'Bearer ' + token;
				config.headers.ValidationTime = seconds;
				config.headers.Validation = CryptoJS.MD5(authData.token + authData.identity.validation + seconds).toString();
				config.clientId = settings.clientId;
			}

			return config;
		};

		var _responseError = function (rejection) {
			if (rejection.status === 401 && !rejection.config.bypassExceptionInterceptor) {
				$log.info('Session expired');

				// limpa dados de autenticação
				_resetAuthData();

				// emite evento de sessão expirada
				$rootScope.$broadcast('jedi.security:session-expired', rejection.data, rejection.status, rejection.config);
			}
			return $q.reject(rejection);
		};

		authInterceptorServiceFactory.request = _request;
		authInterceptorServiceFactory.responseError = _responseError;

		return authInterceptorServiceFactory;
	}]).filter('hasRoles', ['jedi.security.SecurityService', function (authService) {
		return function (arr, roles) {

			if (!authService.hasRoles(roles)) {
				return [];
			}

			return arr;
		};
	}]).filter('isAuthenticated', ['jedi.security.SecurityService', function (authService) {
		return function (arr) {

			if (!authService.isAuthenticated) {
				return [];
			}

			return arr;
		};
	}]).directive('jdRolesToShow', ['jedi.security.SecurityService', '$interpolate', function (authService, $interpolate) {
		return {
			restrict: 'A',
			link: function ($scope, element) {
				var asRolesToShow = element.attr('jd-roles-to-show');

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
		};
	}]).directive('jdRolesToActive', ['jedi.security.SecurityService', '$interpolate', function (authService, $interpolate) {
		return {
			restrict: 'A',
			link: function ($scope, element) {
				var asRolesToActive = element.attr('jd-roles-to-active');

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
		};
	}]).directive('jdActive', ['jedi.security.SecurityService', '$interpolate', function (authService, $interpolate) {
	    return {
	        restrict: 'A',
	        link: function ($scope, element) {
	            var isActive = element.attr('jd-active');

	            $scope.$watch(function () {
	                var value = $interpolate('{{' + isActive + '}}')($scope);
	                return $scope.$eval(value)
	            },
				function (value) {
				    var elem;

				    elem = element;

				    if (!value) {
				        angular.forEach(elem, function (item) {

				            var $item = $(item);
				            $item.attr('disabled', true);
				            $item.attr('readonly', true);

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
	    };
	}]).config(['$httpProvider', function ($httpProvider) {
		// register authInterceptor
		$httpProvider.interceptors.push('jedi.security.SecurityInterceptor');

		angular.forEach($httpProvider.defaults.headers, function (header) {
            delete header['X-Requested-With'];
            header['If-Modified-Since'] = 'Thu, 01 Jan 1970 00:00:00 GMT';
		});
	}]).run(['$log', 'jedi.security.SecurityService', '$timeout', function($log, authService, $timeout) {
		$timeout(function(){
			$log.info('Initializing jedi security component');
			authService.initialize();
		});
	}]);
}));