angular.module('<%= _.camelize(name) %>', ['ui.bootstrap','ui.utils','<%= routerModuleName %>','ngAnimate']);
<% if (!uirouter) { %>
angular.module('<%= _.camelize(name) %>').config(function($routeProvider) {
    <%= config.get('jsstrict') ? "'use strict';\n" : "" %>
    /* Add New Routes Above */

});
<% } %><% if (uirouter) { %>
angular.module('<%= _.camelize(name) %>').config(function($stateProvider) {
    <%= config.get('jsstrict') ? "'use strict';\n" : "" %>
    /* Add New States Above */

});
<% } %>
