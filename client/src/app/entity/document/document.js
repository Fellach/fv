(function(module) {

    module.factory('Document', function ($resource) {
        return $resource('/api/document/:id', 
            {id: "@id"}, 
            {
                update: {
                    method: "PUT" 
                },
                save: {
                    method: "POST" 
                },
                delete: {
                    method: "DELETE" 
                },
            }
            );
    });

}(angular.module("fv.entity.document")));