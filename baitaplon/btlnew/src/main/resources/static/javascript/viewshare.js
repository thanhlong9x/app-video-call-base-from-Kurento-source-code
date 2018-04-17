angular.module("viewshare", [])
    .controller('viewshareController', function ($scope, user, mainService) {
        $scope.user = user;

    });