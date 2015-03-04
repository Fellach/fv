(function(module) {

    module.config(function ($stateProvider) {
        $stateProvider.state('fv.clients', {
            url: '/clients',
            views: {
                "main@": {
                    controller: 'ClientsController as model',
                    templateUrl: 'clients/grid.tpl.html'
                }
            },
            resolve: {
                clients: function(clients) {
                    return clients;
                }
            },
            data:{ pageTitle: 'Clients' }
        });
    });

}(angular.module("fv.clients", [
    'ui.router'
])));
