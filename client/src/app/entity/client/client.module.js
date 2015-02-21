(function(module) {

    module.config(function ($stateProvider) {
        $stateProvider.state('entity.client', {
            url: '/entity.client',
            views: {
                "main": {
                    controller: 'Entity.clientController as model',
                    templateUrl: 'entity.client/entity.client.tpl.html'
                }
            },
            data:{ pageTitle: 'Entity.client' }
        });
    });

}(angular.module("fv.entity.client", [
    'ui.router'
])));
