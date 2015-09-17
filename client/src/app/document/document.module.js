(function(module) {

    module.config(function ($stateProvider) {
        $stateProvider.state('fv.documents.detail', {
            url: '/{id:int}',
            views: {
                "aside@": {
                    controller: 'DocumentController as model',
                    templateUrl: 'document/detail.tpl.html',
                }
            },
            resolve: {
                document: function (documents, $stateParams) {
                    //return documents[$stateParams.id];
                    for (var i = 0; i < documents.length; i++) {
                        if (documents[i].id == $stateParams.id) {
                            return documents[i];
                        }
                    }
                }
            },
            data: { pageTitle: 'Faktura' }
        });
        $stateProvider.state('fv.documents.new', {
            url: '/new',
            views: {
                "main@": {
                    controller: 'DocumentController as model',
                    templateUrl: 'document/edit.tpl.html'
                },
                "aside@": {
                    controller: 'ClientsController as model',
                    templateUrl: 'clients/list.tpl.html'
                }
            },
            resolve: {
                document: function (Document) {
                    return new Document();
                }
            },
            data:{ pageTitle: 'Nowa faktura' }
        });
        $stateProvider.state('fv.documents.edit', {
            url: '/edit/{id:int}',
            views: {
                "main@": {
                    controller: 'DocumentController as model',
                    templateUrl: 'document/edit.tpl.html'
                },
                "aside@": {
                    controller: 'ClientsController as model',
                    templateUrl: 'clients/list.tpl.html'
                }
            },
            resolve: {
                document: function (documents, $stateParams) {
                    for (var i = 0; i < documents.length; i++) {
                        if (documents[i].id == $stateParams.id) {
                            return documents[i];
                        }
                    }
                }
            },
            data:{ pageTitle: 'Edycja faktury' }
        });
    });

}(angular.module("fv.document", [
    'ui.router'
])));
