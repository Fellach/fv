(function(module) {

    module.controller('DocumentController', function (options, document, documents, Document, $timeout, $scope, $window, $state, $filter) {
        var model = this;
        model.document = angular.copy(document);
        model.client = {};
        model.options = options;
        model.save = save;
        model.get = get;
        model.remove = remove;
        model.addItem = addItem;
        model.removeItem = removeItem;
        model.send = send;
        model.calculate = calculate;
        model.onDateChange = onDateChange;
        model.duplicate = duplicate;
        model.cancel = cancel;
        var copy = {};

        init();

        function init() {
            $timeout(onReady, 100);

            var onClientChooseHandler = $scope.$on('fv.client.choose', onClientChoose);
            $scope.$on('$destroy', function(){
                onClientChooseHandler();
                cancel();
            });

            if (!model.document.id) {
                initDoc(true);
                addItem();
            } else {
                model.client = model.document.client;
            }

            copy = angular.copy(model.document);
        }

        function onReady() {
            $('.collapsible').collapsible({
              accordion : false
          });

            $('select').material_select();

            $(".button-collapse").sideNav({closeOnClick: true});
            if (!model.document.id) {
                $(".button-collapse").sideNav('show');
            }

            $('.datepicker').pickadate({
                today: 'Dziś',
                clear: '',
                close: 'Zamknij',
                firstDay: 1,
                monthsFull: [ 'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień' ],
                monthsShort: [ 'sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru' ],
                weekdaysFull: [ 'niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota' ],
                weekdaysShort: [ 'niedz.', 'pn.', 'wt.', 'śr.', 'cz.', 'pt.', 'sob.' ],
                format: 'yyyy-mm-dd',
                formatSubmit: 'yyyy-mm-dd',
            });

            $('.modal-trigger').leanModal();
        }

        function save() {
            if (model.document.id) {
                model.document.$update(function (data) {
                    Materialize.toast('Zapisano', 2000);
                    model.document = data;
                    document = angular.extend(document, data);

                }, onFailure);
            } else {
                model.document.$save(function (data) {
                    model.document = data;
                    documents.push(data);
                    Materialize.toast('Zapisano', 2000);
                    $state.go('fv.documents.edit', {id: data.id});

                }, onFailure);
            }
        }

        function get() {
            $window.location = 'api/document/pdf/' + model.document.id;
        }

        function send() {
            model.document.$email(function (data){
                Materialize.toast('Wysłano do ' + model.document.client.email, 3000);                
            }, onFailure);
        }

        function remove() {
            model.document.$remove(function (data){
                if (data.status === 200) {
                    for (var i = 0; i < documents.length; i++) {
                        if (documents[i].id === model.document.id) {
                            Materialize.toast('Usunięto', 2000);
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

        function removeItem(item, index) {
            model.document.items.splice(index, 1);
            calculateSums();

            if (!!item.id) {
                Document.removeItem({id: model.document.id, id_item: item.id}).$promise.then(function (data){
                    if (data.status === 200) {
                        Materialize.toast('Usunięto', 2000);
                    } else {
                        model.document.items.push(item);
                    }
                });
            }
        }


        function onClientChoose(event, client) {
            model.document.client_id = client.id;
            model.client = client;
        }

        function onFailure(response) {
            console.log(response);
            Materialize.toast('Błąd', 3000);
        }

        function onDateChange() {
            model.document.serial_number = generateSerial(new Date(model.document.print_date));
            model.document.sell_date = model.document.print_date;
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
                calculateSums();
            }
        }

        function calculateSums() {
            model.document.netto = model.document.vat = model.document.brutto = 0;

            angular.forEach(model.document.items, function(item){
                model.document.netto += parseFloat(item.netto); 
                model.document.vat += parseFloat(item.vat_value); 
                model.document.brutto += parseFloat(item.brutto); 
            });
        }

        function duplicate() {
            delete model.document.id;
            for (var i = model.document.items.length - 1; i >= 0; i--) {
                delete model.document.items[i].id;
            }
            initDoc();
        }

        function cancel() {
            model.document = angular.copy(copy);
        }

        function initDoc(isInitWithItems) {
            model.document = angular.extend(model.document, { 
                serial_number: generateSerial(new Date()), 
                serial_number_suffix: generateSuffix(),
                print_date: $filter('date')(new Date(), 'yyyy-MM-dd'),
                sell_date: $filter('date')(new Date(), 'yyyy-MM-dd')
            });

            if (isInitWithItems) {
                model.document.items = [];
            }
        }

    });

}(angular.module("fv.document")));