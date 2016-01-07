(function(){ /* protecting code with an iife */ 
    angular.module('<%= _.camelize(appname) %>', ['ui.bootstrap','ui.utils','<%= routerModuleName %>','ngAnimate']);
    <% if (!uirouter) { %>
    angular.module('<%= _.camelize(appname) %>').config(function($routeProvider) {
        <%= config.get('jsstrict') ? "'use strict';\n" : "" %>
        /* Add New Routes Above */
        $routeProvider.otherwise({redirectTo:'/home'});

    });
    <% } %><% if (uirouter) { %>
    angular.module('<%= _.camelize(appname) %>').config(function($stateProvider, $urlRouterProvider) {
        <%= config.get('jsstrict') ? "'use strict';\n" : "" %>
        /* Add New States Above */
        $urlRouterProvider.otherwise('/home');

    });
    <% } %>
    angular.module('<%= _.camelize(appname) %>').run(function($rootScope) {
        <%= config.get('jsstrict') ? "'use strict';\n" : "" %>
        $rootScope.safeApply = function(fn) {
            var phase = $rootScope.$$phase;
            if (phase === '$apply' || phase === '$digest') {
                if (fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };
    });
})();
