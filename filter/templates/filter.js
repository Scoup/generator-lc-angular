angular.module('<%= appname %>').filter('<%= name %>', function() {
    <%= config.get('jsstrict') ? "'use strict';\n" : "" %>
    return function(input,arg) {
        return 'output';
    };
});