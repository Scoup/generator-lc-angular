angular.module('<%= appname %>').directive('<%= name %>', function() {
    <%= jsstrict ? "'use strict';\n" : "" %>
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
