(function(module) {

    module.controller('DocumentController', function (options, document, documents, $timeout, $scope, $window) {
        var model = this;
        model.document = document;
        model.options = options;
        model.save = save;
        model.get = get;
        model.remove = remove;
        model.addItem = addItem;

        init();

        function init() {
            $timeout(jql, 100);
            $scope.$on('fv.client.choose', onClientChoose);

            if (!model.document.id) {
                model.document = angular.extend(model.document, {items: [], serial_number: generateSerial(), serial_number_suffix: generateSuffix() });
                addItem();
            }
        }

        function jql() {
            $('.collapsible').collapsible({
              accordion : false
          });

            $('select').material_select();

            $('.datepicker').pickadate({
                today: 'Dziś',
                clear: '',
                close: 'Zamknij',
                firstDay: 1,
                monthsFull: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
                weekdaysShort: ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'],
                format: 'yyyy-mm-dd',
                formatSubmit: 'yyyy-mm-dd',
            });
        }

        function save() {
            if (model.document.id) {
                model.document.$update();
            } else {
                model.document.$save(onSuccess, onFailure);
            }
        }

        function get() {
            $window.location = 'http://fv.majuskula.pl/api/pdf/' + model.document.id;
        }

        function remove() {
            model.document.$delete( );
        }

        function onClientChoose(event, client) {
            model.document.client_id = client.id;
        }

        function onSuccess(data, headers) {
            documents.push(data);
            toast('Zapisano', 2000);
        }

        function onFailure(response) {
            console.log(response);
            toast('Błąd', 3000);
        }

        function addItem() {
            model.document.items.push({title: '', price:0, vat:23, pieces:1,vat_value:0,netto:0,brutto:0});
        }

        function generateSerial() {
            var lastNumber = documents[documents.length - 1].serial_number;
            return ++lastNumber;
        }

        function generateSuffix() {
            return '/15';
        }
    });

}(angular.module("fv.document")));