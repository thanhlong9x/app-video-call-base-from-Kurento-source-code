//joinshare
angular.module("joincall", [])
    .controller('joincallController', function ($scope, user, mainService, $location) {
        $scope.user  = user;
        $scope.createRoom = function () {
            var message = {
                id : 'joinRoom',
                name : $scope.user.name,
                room : $scope.roomCall
            };
            mainService.sendMessage(message);
            $location.path('/viewcall');
        }
    });