/*global angular:true, browser:true */

/**
 * @license HTTP Auth Redirector Module for AngularJS
 * (c) 2014 Can Kayacan
 * License: MIT
 */
(function () {
    'use strict';

    angular.module('http-auth-redirector', [])

    .provider('authService', function() {
        var defaultRedirectPath = '';
        var loginPath = '';

        /**
         * Sets the default redirect path.
         * @param path path to set for default redirect.
         */
        this.setDefaultRedirectPath = function (path) {
            defaultRedirectPath = path;
        };

        /**
         * Sets the login path.
         * @param path path to set for login.
         */
        this.setLoginPath = function (path) {
            loginPath = path;
        };

        this.$get = ['$rootScope', '$location', '$timeout', function ($rootScope, $location, $timeout) {
            var redirectPath = '';
            var lastCapturedPath = '';

            $rootScope.$on('$routeChangeStart', function(event, next, current) {
                lastCapturedPath = $location.url();
            });

            $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
                lastCapturedPath = $location.url();
            });

            return {
                /**
                 * Call this function to indicate that authentication was successful and redirect to the
                 * rejected page.
                 * @param data an optional argument to pass on to $broadcast which may be useful for
                 * example if you need to pass through details of the user that was logged in
                 */
                loginConfirmed: function (data) {
                    $location.path(this.getRedirectPath());
                    this.clearRedirectPath();
                    $rootScope.$broadcast('event:auth-loginConfirmed', data);
                },

                /**
                 * Call this function to indicate that the redirection should not proceed.
                 * @param data an optional argument to pass on to $broadcast.
                 */
                loginCancelled: function (data) {
                    this.clearRedirectPath();
                    $rootScope.$broadcast('event:auth-loginCancelled', data);
                },

                /**
                 * Redirects to the login path.
                 */
                redirectToLogin: function () {
                    if (loginPath !== '') {
                        $timeout(function() { $location.path(loginPath); });
                    }
                },

                /**
                 * This method is to be called by this module only.
                 * This will be called when 401 is received and will save the current path to be redirected after login.
                 */
                saveLastCapturedPath: function () {
                    redirectPath = lastCapturedPath;
                },

                /**
                 * Clears the redirect path.
                 */
                clearRedirectPath: function () {
                    redirectPath = '';
                },

                /**
                 * Sets a custom redirect path.
                 */
                setRedirectPath: function (path) {
                    redirectPath = path;
                },

                /**
                 * Gets the redirect path.
                 */
                getRedirectPath: function (reason) {
                    return redirectPath === '' ? defaultRedirectPath : redirectPath;
                },

                /**
                 * Gets the login path.
                 */
                getLoginPath: function () {
                    return loginPath;
                }
            };
        }];
    })

    /**
     * $http interceptor.
     * On 401 response (without 'ignoreAuthModule' option) stores the rejected path
     * and broadcasts 'event:auth-loginRequired'.
     * On 403 response (without 'ignoreAuthModule' option) discards the request
     * and broadcasts 'event:auth-forbidden'.
     */
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push(['$rootScope', '$q', '$location', 'authService', function ($rootScope, $q, $location, authService) {
            return {
                responseError: function (rejection) {
                    if (!rejection.config.ignoreAuthModule) {
                        switch (rejection.status) {
                            case 401:
                                authService.saveLastCapturedPath();
                                authService.redirectToLogin();
                                $rootScope.$broadcast('event:auth-loginRequired', rejection);
                                break;
                            case 403:
                                $rootScope.$broadcast('event:auth-forbidden', rejection);
                                break;
                        }
                    }
                    // otherwise, default behaviour
                    return $q.reject(rejection);
                }
            };
        }]);
    }]);
})();
