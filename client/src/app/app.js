(function(app) {

    app.config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
        $httpProvider.defaults.withCredentials = true;

        $urlRouterProvider.otherwise('/documents');

        $stateProvider.state('fv', {
            abstract: true,
            resolve: {
                options: function (Options) {
                    var options = {};
                    Options.query(function(response){
                        angular.forEach(response, function(el) {
                            if (!options.hasOwnProperty(el.key)) {
                                options[el.key] = [];
                            }
                            options[el.key].push(el);
                        });
                    });
                    return options;
                },
                clients: function (Client) {
                    return Client.query().$promise;
                },
                documents: function (Document) {
                    return Document.query().$promise;
                },
            },
            template: "<ui-view/>"
        });
    });

    app.run(function () {
    });

    app.controller('AppController', function () {

        init();

        function init() {
        }
    });

}(angular.module("fv", [
    'templates-app',
    'templates-common',
    'ui.router.state',
    'ui.router',
    'fv.documents',
    'fv.document',
    'fv.clients',
    'fv.inWords',
    'fv.entity.options',
    'fv.entity.client',
    'fv.entity.document',
])));
