(function(module) {

    module.controller('ClientsController', function (clients, $rootScope, Client, options) {
        var model = this;
        model.clients = clients;
        model.client = {};
        model.choose = choose;
        model.choosed = 0;
        model.save = save;
        model.edit = edit;
        model.remove = remove;
        model.thumbnail = getThumbnail;
        
        init();

        function init() {
            model.client = new Client();
            var randomThumb = Math.floor(Math.random() * options.thumbnail.length);
            model.client.thumbnail = options.thumbnail[randomThumb].value;
        }

        function choose(client) {
            $rootScope.$broadcast('fv.client.choose', client);
            model.choosed = client.id;
        }

        function save() {
            var id = model.client.id;
            
            model.client.$save(function (data, headers) {
                if (id) {
                    for (var i = 0; i < model.clients.length; i++) {
                        if (model.clients[i].id === id) {
                            model.clients[i] = data;
                        }
                    }
                    toast('Zapisano', 2000);

                } else {
                    model.clients.push(data);
                    toast('Dodano', 2000);
                }
                init();

            }, onFailure);
        }

        function edit(client) {
            model.client = angular.copy(client);
        }

        function remove(client) {
            client.$remove(function (data){
                if (data.status === 200) {
                    for (var i = 0; i < model.clients.length; i++) {
                        if (model.clients[i].id === client.id) {
                            model.clients.splice(i, 1);
                            toast('Usunięto', 2000);
                        }
                    }
                } else {
                    onFailure('Nie usunięto');
                }
            }, onFailure);
        }

        function onFailure(response) {
            console.log(response);
            toast('Błąd', 3000);
        }

        function getThumbnail(src, size) {
            size = (size == 'small') ? '_s' : '_n';

            var dot = src.lastIndexOf('.');
            return src.slice(0, dot) + size + src.slice(dot);
        }
    });

}(angular.module("fv.clients")));