'use strict';

angular.module('linkenBlog.routes', ['ngRoute', 'linkenBlog.controllers']).config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider.
        when('/admin/index', {
            templateUrl: 'admin/topic/wall.html',
            controller: 'WallCtrl'
        }).
        when('/admin/user', {
            templateUrl: 'admin/user/userList.html',
            controller: 'UserCtrl'
        }).
        when('/admin/topic', {
            templateUrl: 'admin/topic/topicList.html',
            controller: 'TopicCtrl'
        }).
        when('/admin/videowall', {
            templateUrl: 'admin/topic/wall.html',
            controller: 'WallCtrl'
        }).
        when('/admin/layout', {
            templateUrl: 'admin/login.html',
            controller: 'LogoutCtrl'
        }).
        when('/admin/story', {
            templateUrl: 'admin/story/storyList.html',
            controller: 'storyCtrl'
        }).
        when('/admin/huser', {
            templateUrl: 'admin/huser/huserList.html',
            controller: 'HuserCtrl'
        }).
        otherwise({
            redirectTo: '/admin/topic'
        });

    $locationProvider.html5Mode(true);
}]);