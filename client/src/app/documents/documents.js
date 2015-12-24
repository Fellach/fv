(function(module) {

    module.controller('DocumentsController', function (options, documents, Document, $state, $scope, $timeout, $filter, $rootScope) {
        var model = this;
        model.documents = documents;
        model.options = options;
        model.summary = {vat: 0, netto: 0, brutto: 0};
        model.summaryIncrease = summaryIncrease;
        model.view = view;
        model.edit = edit;
        model.month = '';
        model.months = {};
        model.monthsFilter = monthsFilter;
        model.years = [2015, 2016];
        model.getDocsByYear = getDocsByYear;

        var year;

        init();

        function init() {
            createFilters();

            $timeout(onReady);
        }

        function createFilters() {
            model.months = {};

            for (var i = 0; i < model.documents.length; i++) {
                model.months[$filter('date')(model.documents[i].print_date, 'M')] = $filter('date')(model.documents[i].print_date, 'MMMM');
            }

            model.month = $filter('date')(model.documents[model.documents.length - 1].print_date, 'M');
            year = $filter('date')(model.documents[model.documents.length - 1].print_date, 'yyyy');
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

        function getDocsByYear(y) {
            if (year != y) {
                Document.query({year: y}).$promise.then(function(results) {
                    documents.length = 0;
                    angular.extend(documents, results);
                    model.documents = documents;

                    createFilters();
                });
                year = y;
                Materialize.toast('Zmieniono rok księgowy.', 2000);
            }
        }

        $rootScope.$on('document.year.change', function(event, year) {
            getDocsByYear(year);
        });
    });

}(angular.module("fv.documents")));