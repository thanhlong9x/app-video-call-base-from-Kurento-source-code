//joinshare
angular.module("joinshare", [])
    .controller('joinshareController', function ($scope, user, mainService, $location) {
        $scope.user = user;
        $scope.registerShare = function () {
            var message = {
                id: 'joinShareRoom',
                name: $scope.user.name,
                room: $scope.roomShare
            };
            mainService.sendMessage(message);
            $location.path('/viewshare');
        };
        $scope.viewShare = function () {
            $location.path('/viewshare');
            var message = {
                id: 'viewShareRoom',
                name: $scope.user.name,
                room: $scope.roomShare
            };
            mainService.sendMessage(message);
        }
    });