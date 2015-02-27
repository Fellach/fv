(function(module) {

    module.config(function ($stateProvider) {
        $stateProvider.state('fv.documents', {
            url: '/documents',
            views: {
                "main@": {
                    controller: 'DocumentsController as model',
                    templateUrl: 'documents/documents.tpl.html',
                },
                "aside@": {
                  controller: 'DocumentsController as model',
                  templateUrl: 'documents/about.tpl.html',  
                }
            },
            data:{ pageTitle: 'Ostatnie faktury' },
        });
    });

}(angular.module("fv.documents", [
    'ui.router',
])));