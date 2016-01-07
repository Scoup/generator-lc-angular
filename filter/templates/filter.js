angular.module('<%= appname %>').filter('<%= _.camelize(name) %>', function() {
    <%= config.get('jsstrict') ? "'use strict';\n" : "" %>
    return function(input,arg) {
        return 'output';
    };
});