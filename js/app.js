(function () {
    'use strict';

    var app = angular.module("TruckShop", ["ngRoute"]);

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
            .otherwise({
                redirectTo: "/products"
            });
    }]);

    // global vars
    app.run(function($rootScope, $http) {
        $http.get('/params.json').then(function(response) {
            $rootScope.params = response.data;

            console.log($rootScope.params);
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
        var productId = $routeParams.productId * 1;

        $scope.isPhone = false;

        dataService.async().then(function (response) {
            $scope.element = response.data[productId];
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
})();