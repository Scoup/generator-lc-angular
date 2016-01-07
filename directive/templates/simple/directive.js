angular.module('<%= appname %>').directive('<%= _.camelize(name) %>', function() {
    <%= config.get('jsstrict') ? "'use strict';\n" : "" %>
    return {
        restrict: 'A',
        link: function(scope, element, attrs, fn) {


        }
    };
});