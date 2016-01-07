angular.module('<%= appname %>').factory('<%= _.camelize(name) %>',function() {
    <%= config.get('jsstrict') ? "'use strict';\n" : "" %>
    var <%= _.camelize(name) %> = {};

    return <%= _.camelize(name) %>;
});