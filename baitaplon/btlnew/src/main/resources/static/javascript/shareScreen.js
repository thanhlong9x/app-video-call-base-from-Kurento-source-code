(function(angular) {
    'use strict';
    angular.module('share-screen', [])

        .component('shareScreen', {
            template: '<h2>ShareScreen</h2><ng-outlet></ng-outlet>',
            $routeConfig: [
                {path: '/',    name: 'CreateRoomShare',   component: 'createRoomShare', useAsDefault: true},
                {path: '/view', name: 'ViewRoomShare', component: 'viewRoomShare'}
            ]
        })

        .component('createRoomShare', {
            template:
            '<a ng-link="[\'ViewRoomShare\']">To View</a>',
            controller: createShareComponent
        })

        .component('viewRoomShare', {
            template:
            '  <h3>View</h3>',
            bindings: { $router: '<' },
            controller: viewShareComponent
        });

    function createShareComponent() {

    }

    function viewShareComponent() {

    }
})(window.angular);
