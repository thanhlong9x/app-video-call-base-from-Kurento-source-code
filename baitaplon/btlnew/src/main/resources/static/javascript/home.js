//home
angular.module("home", [])
    .controller("homeController", function ($scope, user, mainService) {
        $scope.user = user;
        $scope.mainService = mainService;
        $scope.listOnline = mainService.getListOnline();

        $scope.$on('updateListOnline', function (event, args) {
            $scope.listOnline = mainService.getListOnline();
            $scope.$digest()
        });
    });


