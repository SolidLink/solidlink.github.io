'use strict';

var module = angular.module('testApp', ['ngRoute','ui.bootstrap','angularMoment']);
module.factory('todoStorage', function () {
   var STORAGE_ID = 'todos-angularjs-perf';

   return {
      get: function () {
         return $.parseJSON(localStorage.getItem(STORAGE_ID) || '[]');
      },

      put: function (todos) {
         localStorage.setItem(STORAGE_ID, JSON.stringify(todos));
      }
   };
});
module.factory('basketballStorage', function () {
   var STORAGE_ID = 'basketball-local';

   return {
      get: function () {
         return $.parseJSON(localStorage.getItem(STORAGE_ID));
      },

      put: function (basketball) {
         localStorage.setItem(STORAGE_ID, JSON.stringify(basketball));
      }
   };
});
module.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'templates/main.html'
      })
      .when('/todo', {
        templateUrl: 'templates/todo.html',
        controller: 'ToDoCtrl'
      })
      .when('/basketball', {
        templateUrl: 'templates/basketball.html',
        controller: 'BasketballCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);

module.controller('ToDoCtrl', function ($scope, todoStorage) {
   var todos = $scope.todos = todoStorage.get() || {};
   $scope.message = 'This is Add new order screen';
   $scope.newTodo = '';
   $scope.addTodo = function () {
      var newTodo = $scope.newTodo.trim();
      if (newTodo.length === 0) {
         return;
      }

      todos.push({
         title: newTodo,
         completed: false
      });
      todoStorage.put(todos);

      $scope.newTodo = '';
   };
   $scope.editTodo = function (todo) {
      $scope.editedTodo = todo;
      $scope.originalTodo = angular.extend({}, todo);
   };
   $scope.doneEditing = function (todo) {
      $scope.editedTodo = null;
      todo.title = todo.title.trim();

      if (!todo.title) {
         $scope.removeTodo(todo);
      }

      todoStorage.put(todos);
   };
   $scope.removeTodo = function (todo) {
      todos.splice(todos.indexOf(todo), 1);
      todoStorage.put(todos);
   };
   $scope.todoCompleted = function (todo) {
      todoStorage.put(todos);
   };
});
module.controller('BasketballCtrl', function ($scope, moment, basketballStorage, $interval) {
   var basketball = $scope.basketball = basketballStorage.get(),
    counter;

   $scope.error = {};
   function save() {
     basketball.variables = {
      startTime: basketball.startTime
     };
     basketballStorage.put(basketball);
   };
   $scope.start = function () {
    if (basketball.startTime) {
      save();
      $scope.error.startTime = false;
       counter = $interval(function() {
          var time = basketball.startTime.split(':'),
            min = time[0],
            sec = time[1] ? time [1] : '00',
            now = moment({minute: min, second: sec});
          basketball.startTime = now.subtract(1, 'second').format('mm:ss');
          console.log(basketball.startTime);
       }, 1000);
    } else {
      $scope.error.startTime = true;
    }
   };
   $scope.stop = function () {
    $interval.cancel(counter);
    counter = undefined;
   };
   $scope.restart = function () {
    basketball.startTime = basketball.variables.startTime;
   };
   $scope.score = function (team, point) {
      basketball[team + 'Score'] = basketball[team + 'Score'] + point;
   };
});
