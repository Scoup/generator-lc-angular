angular.module('<%= appname %>').filter('<%= name %>', function() {
    <%- jsstrict ? "'use strict';\n" : "" %>
    return function(input,arg) {
        return 'output';
    };
});