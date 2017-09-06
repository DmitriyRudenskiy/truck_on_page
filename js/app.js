(function () {
    'use strict';

    function getInMouth(price, period, advance) {
        var percent = 6.5;

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
            .otherwise({
                redirectTo: "/products"
            });
    }]);

    // global vars
    app.run(function($rootScope, $http, $location) {
        $rootScope.url = $location.absUrl();


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
        var productId = $routeParams.productId * 1;

        $scope.price = 0;
        $scope.period = 60;
        $scope.advance = 50;

        dataService.async().then(function (response) {
            $scope.element = response.data[productId];
        });


        $timeout(function () {
            $scope.price = $scope.element.price;
        }, 500);


        $scope.getInMouth = function (price, period, advance) {
            return getInMouth($scope.price, $scope.period, $scope.advance);
        };
    });
})();