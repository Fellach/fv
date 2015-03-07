(function(module) {

    module.factory('Client', function ($resource) {
        return $resource('/api/client/:id', 
            {id: "@id"}, 
            {
                save: {method: 'POST'},
                remove: {method: "DELETE" }
            });
    });

}(angular.module("fv.entity.client")));