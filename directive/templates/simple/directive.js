angular.module('<%= appname %>').directive('<%= name %>', function() {
    <%- jsstrict ? "'use strict';\n" : "" %>
    return {
        restrict: 'A',
        link: function(scope, element, attrs, fn) {


        }
    };
});