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
                pdf: {
                    method: "GET",
                    url: '/api/document/pdf/:id'
                },
                email: {
                    method: "GET",
                    url: '/api/document/pdf/send/:id'
                }
            }
        );
    });

}(angular.module("fv.entity.document")));