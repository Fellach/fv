(function(module) {

    module.controller('DocumentController', function (options, document, documents, $timeout, $scope, $window, $state) {
        var model = this;
        model.document = document;
        model.client = {};
        model.options = options;
        model.save = save;
        model.get = get;
        model.remove = remove;
        model.addItem = addItem;
        model.send = send;
        model.calculate = calculate;
        model.onDateChange = onDateChange;

        init();

        function init() {
            $timeout(onReady, 100);
            $scope.$on('fv.client.choose', onClientChoose);

            if (!model.document.id) {
                model.document = angular.extend(model.document, {items: [], serial_number: generateSerial(new Date()), serial_number_suffix: generateSuffix() });
                addItem();
            } else {
                model.client = document.client;
            }
        }

        function onReady() {
            $('.collapsible').collapsible({
              accordion : false
          });

            $('select').material_select();

            $(".button-collapse").sideNav({closeOnClick: true});

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
            model.document.$remove(function (data){
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
            model.client = client;
        }

        function onFailure(response) {
            console.log(response);
            toast('Błąd', 3000);
        }

        function onDateChange() {
            model.document.serial_number = generateSerial(new Date(model.document.print_date));
        }


        function generateSerial(printDate) {
            try {
                var last = {},
                    month = (printDate.getMonth() + 1).toString();

                angular.forEach(documents, function(doc) {
                    if ((new Date(doc.print_date)).getMonth() + 1 == month) {
                        last = doc;
                    }
                });    

                if (last.serial_number) {
                    return parseInt(last.serial_number) + 1;
                } else {
                    return month + "1";
                }

            } catch (Error) {
                return month + "1";
            }
        }

        function generateSuffix() {
            var today = new Date();
            return '/' + (today.getFullYear() - 2000).toString();
        }

        function calculate(item, whatChanged) {
            if (item.pieces && item.vat) {
                switch (whatChanged) {
                    case 'brutto':
                        item.price = (100 * item.brutto) / (item.pieces * (100 + item.vat));
                        item.netto = item.price * item.pieces;
                        item.vat_value = item.netto * item.vat / 100;
                        break;
                    case 'netto':
                        item.price = item.netto / item.pieces;
                        item.vat_value = item.netto * item.vat / 100;
                        item.brutto = item.netto + item.vat_value;
                        break;
                    case 'vat':
                        item.price = (100 * item.vat_value) / (item.vat * item.pieces);
                        item.netto = item.price * item.pieces;
                        item.brutto = item.netto + item.vat_value;
                        break;
                    default:
                        item.netto = item.price * item.pieces;
                        item.vat_value = item.netto * item.vat / 100;
                        item.brutto = item.netto + item.vat_value;
                }

                model.document.netto = model.document.vat = model.document.brutto = 0;

                angular.forEach(model.document.items, function(item){
                    model.document.netto += item.netto; 
                    model.document.vat += item.vat_value; 
                    model.document.brutto += item.brutto; 
                });
            }
        }

    });

}(angular.module("fv.document")));