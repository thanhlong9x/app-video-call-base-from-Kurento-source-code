var ws = new WebSocket('wss://' + location.host + '/groupcall');
window.onbeforeunload = function () {
    console.log("close ws");
    ws.close();
};

var app = angular.module("main", ["ngRoute", "login", "header", "mainService", "home", "joinshare", "viewshare", "joincall", "viewcall"]);
app.factory("user", function () {
    return {};
});
app.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "./components/login.html",
            controller: 'loginController'
        })
        .when("/home", {
            templateUrl: "./components/home.html",
            controller: 'homeController'
        })
        .when("/joinshare", {
            templateUrl: "./components/joinshare.html",
            controller: 'joinshareController'
        })
        .when("/viewshare", {
            templateUrl: "./components/viewshare.html",
            controller: 'viewshareController'
        })
        .when("/joincall", {
            templateUrl: "./components/joincall.html",
            controller: 'joincallController'
        })
        .when("/viewcall", {
            templateUrl: "./components/viewcall.html",
            controller: 'viewcallController'
        })
        .otherwise({
            redirectTo: "/"
        });
});

function sendMessage(message) {
    var jsonMessage = JSON.stringify(message);
    console.log('Senging message: ' + jsonMessage);
    ws.send(jsonMessage);
}