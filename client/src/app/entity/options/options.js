(function(module) {

    module.factory('Options', function ($resource) {
        return $resource('/api/options');
    });

}(angular.module("fv.entity.options")));