angular.module('<%= appname %>').controller('<%= ctrlname %>',function($scope){
    <%= config.get('jsstrict') ? "'use strict';\n" : "" %>

});