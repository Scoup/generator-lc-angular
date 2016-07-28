angular.module('<%= appname %>').factory('<%= name %>',function() {
    <%= 'jsstrict' ? "'use strict';\n" : "" %>
    var <%= name %> = {};

    return <%= name %>;
});