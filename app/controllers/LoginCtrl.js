"use strict";

app.controller( "LoginCtrl", function ($scope, AuthFactory) {

  $scope.loginToGoogle = function () {
    AuthFactory.authWithProvider();
  };

  $scope.logoutOfGoogle = function () {
    AuthFactory.signOut();
  };

});