angular.module('<%= name %>', ['ui.bootstrap','ui.utils','<%= routerModuleName %>','ngAnimate']);
<% if (!uirouter) { %>
angular.module('<%= name %>').config(function($routeProvider) {
    <%- jsstrict ? "'use strict';\n" : "" %>
    /* Add New Routes Above */

});
<% } %><% if (uirouter) { %>
angular.module('<%= name %>').config(function($stateProvider) {
    <%- jsstrict ? "'use strict';\n" : "" %>
    /* Add New States Above */

});
<% } %>
