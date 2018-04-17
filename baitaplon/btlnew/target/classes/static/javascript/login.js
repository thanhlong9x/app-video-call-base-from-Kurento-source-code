//login
angular.module("login", [])
    .controller("loginController", function ($scope, user, $location, mainService) {
        $scope.user = user;
        $scope.login = function () {
            $scope.user.name = $scope.name;
            // console.log($scope.name);
            var message = {
                id: 'login',
                name: $scope.name,
            };
            mainService.sendMessage(message);
            mainService.sendMessage({
                id: 'getListOnline',
                requester: $scope.name
            });

            $location.path('/home');
        }
    });

