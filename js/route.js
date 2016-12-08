/**
 * Created by Raef M on 11/24/2016.
 */
(function(){
    angular.module('artworks').config(function($routeProvider){
       $routeProvider
           .when("/home", {
               templateUrl: '/templates/home/index.html',
               controller: 'HomeController',
               controllerAs: 'home'
           })
           .otherwise({
               redirectTo: "/home"
           });
    });
})();