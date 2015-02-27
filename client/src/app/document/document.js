(function(module) {

    module.controller('DocumentController', function (options, document, documents, $timeout, $scope, $window, $state) {
        var model = this;
        model.document = document;
        model.options = options;
        model.save = save;
        model.get = get;
        model.remove = remove;
        model.addItem = addItem;
        model.send = send;

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

            $('.modal-trigger').leanModal();
        }

        function save() {
            if (model.document.id) {
                model.document.$update(function (data) {
                    toast('Zapisano', 2000);

                }, onFailure);
            } else {
                model.document.$save(function (data) {
                    documents.push(data);
                    toast('Zapisano', 2000);
                    $state.go('fv.documents.edit', {id: data.id});

                }, onFailure);
            }
        }

        function get() {
            $window.location = 'api/document/pdf/' + model.document.id;
        }

        function send() {
            model.document.$email(function (data){
                toast('Wysłano do ' + model.document.client.email, 3000);                
            }, onFailure);
        }

        function remove() {
            model.document.$delete(function (data){
                if (data.status === 200) {
                    for (var i = 0; i < documents.length; i++) {
                        if (documents[i].id === model.document.id) {
                            toast('Usunięto', 2000);
                            documents.splice(i, 1);
                            $state.go('fv.documents');
                        }
                    }
                } else {
                    onFailure('Nie usunięto');
                }
            }, onFailure);
        }

        function addItem() {
            model.document.items.push({title: '', price:0, vat:23, pieces:1, vat_value:0, netto:0, brutto:0});
        }


        function onClientChoose(event, client) {
            model.document.client_id = client.id;
        }

        function onFailure(response) {
            console.log(response);
            toast('Błąd', 3000);
        }


        function generateSerial() {
            var last = documents[documents.length - 1],
                today = new Date(),
                month = (today.getMonth() + 1).toString();

            if ((new Date(last.print_date)).getMonth() + 1 == month) {
                return last.serial_number + 1;
            } else {
                return month + "1";
            }
            
        }

        function generateSuffix() {
            var today = new Date();
            return '/' + (today.getFullYear() - 2000).toString();
        }
    });

}(angular.module("fv.document")));