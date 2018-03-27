(function(){
	"use strict";
	
	angular.module('pumpApp').controller('pumpDetailsController', ['$scope', '$state', '$stateParams', '$rootScope', '$http', '$interval',
		function($scope, $state, $stateParams, $rootScope, $http, $interval) {
			$rootScope.page = 'pumpdetails';
			$rootScope.footerVisible = false;
			$rootScope.isRootBack = false;
			
			$scope.pumpRefresh = false;
			$scope.pumpDetail = $rootScope.selectedPump;
			$scope.isFetchingDetails = false;
			$scope.getPumpDetailsInterval = null;
			
			$scope.pumpDetailsBasics = [
				{
					title:'Room Temperature',
					valueKey:'roomTemperature',
					collapsed: true
				},
				{
					title:'Battery Voltage',
					valueKey:'batteryVoltage',
					collapsed: true
				},
				{
					title:'Water Level',
					valueKey:'waterLevel',
					collapsed: true
				},
				{
					title:'Water Current',
					valueKey:'waterCurrent',
					collapsed: true
				}
			];
			
			$scope.fixItemHeight = function(parentClass, fixClass) {
				var height = $(parentClass).height()*0.11;
				$(fixClass).height(height+'px');
			};
			
			$scope.getPumpDetails = function() {
				$scope.isFetchingDetails = true;
				var loginData = PumpApp.Request.Builder.Login();

				$rootScope.makeRequest(loginData).then(
					function success(response){
						var getData = PumpApp.Request.Builder.GetPumpById(response.data[1], $stateParams.pumpId);
						$rootScope.makeRequest(getData).then(
							function(response) {
								PumpApp.PumpUtil.updateFromData($scope.pumpDetail, response.data[1]);
								$rootScope.selectedPump = $scope.pumpDetail;
								$scope.pumpRefresh = true;
							},
							function error(e){
								debugger;
							}
						);
					},
					function error(e){
						debugger;
					}
				);
			};
			
			$scope.getPumpRetries = 0;
			$scope.getPumpDetailsInterval = $interval(function() {
				if (!$scope.isFetchingDetails) {
					$scope.getPumpDetails();
				}
				
				if (!$scope.pumpRefresh) {
					$scope.getPumpRetries++;
					if ($scope.getPumpRetries >= 4) {
						alert("No pump information found! Please check your connection.");
						$interval.cancel($scope.getPumpDetailsInterval);
						$scope.getPumpDetailsInterval = null;
						$scope.pumpRefresh = false;
						$scope.isFetchingDetails = false;
					} 
				} else {
					$interval.cancel($scope.getPumpDetailsInterval);
					$scope.getPumpDetailsInterval = null;
					$scope.pumpRefresh = false;
					$scope.isFetchingDetails = false;
				}
			},
			1000);
			
			
			$scope.$on("$destroy",
				function() {
					$rootScope.selectedPump = null;
					if ($scope.getPumpDetailsInterval !== null) {
						$interval.cancel($scope.getPumpDetailsInterval);
					}
				}
			);
			
			$scope.handleHelp = function() {
				
			};
			
			$scope.handleAlarmSettings = function() {
				
			};
			
			$scope.handleHistory = function() {
				
			};
			
			$scope.pumpDetailsBack = function() {
				$rootScope.rootBackFunc = $rootScope.masterRootBack;
				$rootScope.navigateToPage('pumps');
			};
			$rootScope.rootBackFunc = $scope.pumpDetailsBack;
			
			$rootScope.createMenu([
				{
					icon:'fas fa-info-circle',
					title:'Help',
					callback:$scope.handleHelp
				},
				{
					icon:'fas fa-clock',
					title:'Alarm Settings',
					callback:$scope.handleAlarmSettings
				},
				{
					icon:'fas fa-history',
					title:'History',
					callback:$scope.handleHistory
				}
			]);
			
			$scope.getPumpDetails();
	}]);
})();