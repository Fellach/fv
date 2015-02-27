(function(module) {

    module.directive('inWords', function ($q) {
        var G = 
        [
            ['','jeden','dwa','trzy','cztery','pięć','sześć','siedem','osiem','dziewięć','dziesięć','jedenaście','dwanaście','trzynaście','czternaście','piętnaście','szesnaście','siedemnaście','osiemnaście','dziewiętnaście'],
            ['', '', 'dwadzieścia','trzydzieści','czterdzieści','pięćdziesiąt','sześćdziesiąt','siedemdziesiąt','osiemdziesiąt','dziewięćdziesiąt'],      
            ['','sto', 'dwieście', 'trzysta', 'czterysta', 'pięćset', 'sześćset', 'siedemset', 'osiemset', 'dziewięćset'],
        ],

        GG =
        [
            ['milion','miliony','milionów'],
            ['tysiąc','tysiące','tysięcy'],
            ['','',''],
            ['','','']
        ];

        function toWords(s) {
            s = parseFloat(s).toFixed(2);

            var out = '',
            liczby = s.match(/(\d{0,3}?)(\d{0,3}?)(\d{1,3})\.(\d{2})/),
            v = 0;

            liczby.shift();

            for (var tmp = '', j = 0; j < liczby.length - 1; j++, tmp = ''){
                if (liczby[j]){

                    for (var Gi = 0, i = liczby[j].length - 1; i >= 0; i--, Gi++){
                        if (Gi == 1 && liczby[j][i] == 1){
                            tmp = G[0][liczby[j][i]+liczby[j][i+1]] + ' ';
                        } else {
                            tmp = G[Gi][liczby[j][i]] + ' ' + tmp;
                        }
                    }
                    v = parseInt(liczby[j]);
                    out += tmp + ' ' + GG[j][v == 1 ? 0 : (((v < 10 || v > 20) && (liczby[j][liczby[j].length - 1] > 1 && liczby[j][liczby[j].length - 1] < 5)) ? 1 : 2)] + ' ';
                }
            }
            return out + (((v < 10 || v > 20) && (liczby[liczby.length - 2][liczby[liczby.length - 2].length - 1] > 1 && liczby[liczby.length - 2][liczby[liczby.length - 2].length - 1] < 5)) ? ' złote ' : ' złotych ') + liczby[liczby.length - 1] + '/100';  
        }


        return {
            restrict: 'E',
            template: '<span>{{ inWords }}</span>',
            replace: true,
            scope: {
                amount: '=',
                ngModel: '='
            },
            controller: function ($scope) {
                $scope.$watch('amount', function(value) {
                    if (value) {
                        $scope.inWords = toWords(value);
                        $scope.ngModel = $scope.inWords;
                    }
                });
            }
        };
    });

}(angular.module("fv.inWords")));