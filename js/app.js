(function () {
    'use strict';

    function getInMouth(price, period, advance, percent) {
        percent = percent || 6.5;

        return Math.floor((((price * (percent / 100)) * (period / 12) + price) -  (price / 100 * advance)) / period);
    }

    var app = angular.module("TruckShop", ["ngRoute", "angularLazyImg"]);

    // config
    app.config(["$routeProvider", function ($routeProvider) {
        $routeProvider
            .when("/products", {
                controller: "IndexController",
                templateUrl: "/views/list.html"
            })
            .when("/products/view/:productId", {
                controller: "ViewController",
                templateUrl: "/views/view.html"
            })
            .when("/leasing/:productId", {
                controller: "LeasingController",
                templateUrl: "/views/leasing.html"
            })
            .when("/leasing/:productId/:bankId", {
                controller: "InvoiceController",
                templateUrl: "/views/invoice.html"
            })
            .otherwise({
                redirectTo: "/products"
            });
    }]);

    // global vars
    app.run(function($rootScope, $http, $location) {
        $rootScope.url = $location.absUrl();

        $rootScope.banks = [
            {
                "title": "Сбербанк",
                "image": "/img/bank/logo_103.jpg",
                "precent": 6.5,
                "show": true,
                "top": 8
            },
            {
                "title": "Европлан",
                "image": "/img/bank/logo_102.jpg",
                "precent": 8,
                "show": false,
                "top": 20
            },
            {
                "title": "ВТБ",
                "image": "/img/bank/logo_101.jpg",
                "precent": 7,
                "show": false,
                "top": 17
            },
            {
                "title": "Балтийский лизинг",
                "image": "/img/bank/logo_104.jpg",
                "precent": 7.7,
                "show": false,
                "top": 10
            },
            {
                "title": "Siemens",
                "image": "/img/bank/logo_105.jpg",
                "precent": 8.5,
                "show": false,
                "top": 12
            }
        ];


        $http.get('/params.json').then(function(response) {
            $rootScope.params = response.data;
        });
    });

    // filters
    app.filter("marker2br", [
        "$sce",
        function ($sce) {
            return function (input) {
                if (typeof(input) === "string") {
                    var text = input.replace(/\*/g, "<br>");
                    return $sce.trustAs("html", text);
                }

                return "";
            }
        }
    ]);

    app.filter("format_price", function () {
        return function (input) {

            input = Math.ceil(input * 1);

            if (typeof(input) === "number") {
                return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            }

            return "";
        };
    });

    app.filter("in_month", function () {
        return function (input) {
            var price = input * 1;

            if (price < 1) {
                return 0;
            }
            var period = 60;
            var advance = 50;

            return getInMouth(price, period, advance);
        };
    });

    // data
    app.factory("dataService", function ($http) {
        return {
            async: function () {
                return $http.get('/data.json');
            }
        };
    });

    app.controller("IndexController", function ($scope, $location, dataService) {
        // получаем данные
        dataService.async().then(function (response) {
            $scope.items = response.data;
        });

        $scope.view = function (productId) {
            $location.path('/products/view/' + productId);
        };
    });

    app.controller("ViewController", function ($scope, $routeParams, $timeout, dataService) {
        $scope.productId = $routeParams.productId * 1;

        $scope.isPhone = false;

        dataService.async().then(function (response) {
            $scope.element = response.data[$scope.productId];
        });

        $scope.image = function (image) {
            $scope.thumbnail = image;
        };

        $scope.showPhone = function () {
            $scope.isPhone = true;
        };

        $timeout(function () {
            $scope.thumbnail = $scope.element.images[0];
        }, 500);
    });

    app.controller("LeasingController", function ($scope, $routeParams, $timeout, dataService) {
        $scope.productId = $routeParams.productId * 1;

        $scope.price = 0;
        $scope.period = 60;
        $scope.advance = 50;

        dataService.async().then(function (response) {
            $scope.element = response.data[$scope.productId];
        });


        $timeout(function () {
            $scope.price = $scope.element.price;
        }, 500);


        $scope.getInMouth = function (price, period, advance) {
            return getInMouth($scope.price, $scope.period, $scope.advance);
        };
    });

    app.controller("InvoiceController", function ($scope, $routeParams, $timeout, dataService, $location, $rootScope) {
        var productId = $location.search().productId * 1;

        $scope.bank = $rootScope.banks[($location.search().bankId * 1)];
        $scope.period = $location.search().period * 1;
        $scope.advance = $location.search().advance * 1;
        $scope.payment = 0;
        $scope.date = new Date().toLocaleDateString("ru", {"timeZone": "Asia/Krasnoyarsk", year: 'numeric', month: 'long', day: 'numeric'});


        dataService.async().then(function (response) {
            $scope.element = response.data[productId];
        });

        $timeout(function () {
            // ежемесячный платеж
            $scope.payment = getInMouth(
                $scope.element.price,
                $scope.period,
                $scope.advance,
                $scope.bank.precent
            );

            console.log($scope.element);
        }, 500);

        // количество месяцев
        $scope.range = function(count) {
            var input = [];
            var max = Math.ceil(count / 3);

            for (var i = 1; i <= max; i++) {
                input.push(i);
            }

            return input;
        };

        $scope.getDatePayment = function(index) {
            var d = new Date();
            var e = new Date((+new Date) + 2592000000 * (index + 1));

            e.setDate(d.getDate());

            return  e.toLocaleDateString("ru", {"timeZone": "Asia/Krasnoyarsk", year: 'numeric', month: 'numeric', day: 'numeric'});
        };
    });
})();