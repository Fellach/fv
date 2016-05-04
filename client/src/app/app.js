(function(app) {

    app.config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
        $httpProvider.interceptors.push(function() {
          return {
             response: function(response) {
               if (response.status === 403) {
                  document.location.href = 'login';
               }
               return response;
            }
          };
        });

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

    app.controller('AppController', function ($rootScope) {

        init();

        function init() {
            $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
                $rootScope.loaded = true;
                $rootScope.stateName = toState.name;
            });
            $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams){
                $rootScope.error = true;
            });
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
    'ng-currency',
])));
