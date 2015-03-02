(function(module) {

    module.controller('ClientsController', function (clients, $rootScope, Client, $state) {
        var model = this;
        model.clients = clients;
        model.client = new Client();
        model.choose = choose;
        model.save = save;
        model.newUser = newUser;

        init();

        function init() {

        }

        function choose(client) {
            $rootScope.$broadcast('fv.client.choose', client);
        }

        function save() {
            model.client.$save(onSuccess, onFailure);
        }

        function newUser() {
            $state.go('fv.documents.new.add');
        }

        function onSuccess(data, headers) {
            clients.push(data);
            toast('Dodano', 2000);
        }

        function onFailure(response) {
            console.log(response);
            toast('Błąd', 3000);
        }
    });

}(angular.module("fv.clients")));