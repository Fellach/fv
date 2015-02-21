(function(module) {

    module.controller('DocumentsController', function ($state, options, documents) {
        var model = this;
        model.documents = documents;
        model.options = options;
        model.summary = {vat: 0, netto: 0, brutto: 0};
        model.summaryIncrease = summaryIncrease;
        model.view = view;
        model.edit = edit;

        init();

        function init() {
        }

        function summaryIncrease(doc) {
            model.summary.netto += parseFloat(doc.netto);
            model.summary.vat += parseFloat(doc.vat);
            model.summary.brutto += parseFloat(doc.brutto);
        }

        function view(doc) {
            $state.go('fv.documents.detail', {id: doc.id});
        }

        function edit(doc) {
            $state.go('fv.documents.edit', {id: doc.id});
        }
    });

}(angular.module("fv.documents")));