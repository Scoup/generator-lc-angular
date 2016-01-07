angular.module('<%= appname %>').directive('<%= _.camelize(name) %>', function() {
    <%= config.get('jsstrict') ? "'use strict';\n" : "" %>
    return {
        restrict: 'E',
        replace: true,
        scope: {

        },
        templateUrl: '<%= htmlPath %>',
        link: function(scope, element, attrs, fn) {


        }
    };
});
