(function(module) {

    module.controller('DocumentsController', function ($state, options, documents, $timeout, $filter) {
        var model = this;
        model.documents = documents;
        model.options = options;
        model.summary = {vat: 0, netto: 0, brutto: 0};
        model.summaryIncrease = summaryIncrease;
        model.view = view;
        model.edit = edit;
        model.month = $filter('date')(documents[documents.length - 1].print_date, 'M');
        model.months = {};
        model.monthsFilter = monthsFilter;

        init();

        function init() {
            for (var i = 0; i < documents.length; i++) {
                model.months[$filter('date')(documents[i].print_date, 'M')] = $filter('date')(documents[i].print_date, 'MMMM');
            }

            $timeout(onReady);
        }

        function onReady() {
            $('ul.tabs').tabs();
        }

        function summaryIncrease(doc, first) {
            if (first) {
                model.summary = {vat: 0, netto: 0, brutto: 0};
            }
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

        function monthsFilter(doc) {
            return model.month === 0 || model.month === $filter('date')(doc.print_date, 'M');
        }
    });

}(angular.module("fv.documents")));