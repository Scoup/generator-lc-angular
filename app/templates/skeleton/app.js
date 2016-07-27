(function(){ /* protecting code with an iife */ 
    angular.module('<%= appname %>', ['ui.bootstrap','ui.utils','<%= routerModuleName %>','ngAnimate']);
    <% if (!uirouter) { %>
    angular.module('<%= appname %>').config(function($routeProvider) {
        <%= jsstrict ? "'use strict';\n" : "" %>
        /* Add New Routes Above */
        $routeProvider.otherwise({redirectTo:'/home'});

    });
    <% } %><% if (uirouter) { %>
    angular.module('<%= appname %>').config(function($stateProvider, $urlRouterProvider) {
        <%= jsstrict ? "'use strict';\n" : "" %>
        /* Add New States Above */
        $urlRouterProvider.otherwise('/home');

    });
    <% } %>
    angular.module('<%= appname %>').run(function($rootScope) {
        <%= jsstrict ? "'use strict';\n" : "" %>
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
