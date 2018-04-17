//header
angular.module("header", [])
    .component('header', {
        templateUrl: './components/header.html',
        controller: 'headerController'
    })
    .controller('headerController', function ($scope, user, $location, mainService) {
        $scope.user = user;
        $scope.user.name = 'Đăng Nhập';
        $scope.joinShare = function () {
            $location.path('/joinshare');
        },
        $scope.joinCall = function () {
            $location.path('/joincall');
        },
        $scope.goHome = function () {
            mainService.goToHome();
            mainService.getListRoom();
            document.getElementById('headerOverview').outerHTML = "";
            $location.path('/home');
        }
    });
