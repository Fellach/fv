(function(module) {

    module.controller('ClientsController', function (clients, $rootScope, Client) {
        var model = this;
        model.clients = clients;
        model.client = new Client();
        model.choose = choose;
        model.choosed = 0;
        model.save = save;

        init();

        function init() {

        }

        function choose(client) {
            $rootScope.$broadcast('fv.client.choose', client);
            model.choosed = client.id;
        }

        function save() {
            model.client.$save(onSuccess, onFailure);
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