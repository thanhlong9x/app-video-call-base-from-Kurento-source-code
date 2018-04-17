//joinshare
angular.module("viewcall", [])
    .controller('viewcallController', function ($scope, user, mainService, $location) {
        $scope.disableSound = function () {
            mainService.disableSound();
        };
        $scope.leaveRoom = function () {
            mainService.leaveRoom();
        }
    });