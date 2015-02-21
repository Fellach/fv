(function(module) {

    module.factory('Client', function ($resource) {
        return $resource('/api/client/:id', {}, {
            save: {method: 'POST'},
            update: {method: 'PUT'},
        });
    });

}(angular.module("fv.entity.client")));