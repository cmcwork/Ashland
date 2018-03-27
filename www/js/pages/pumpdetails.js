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
			
			$scope.pumpStatusLable = [
				'Water Level', 'Run Status', '', 'Switch Status',
				'Sensor Status', 'Power Status', 'Battery Status', 
				'Temperature Status', 'WiFi Status', 'Cloud Status',
				'Locked/Unlocked', '', 'Pump Status', '', '', ''
			];

			$scope.pumpDetailsBasics = [
				{
					title:'Water Level',
					valueKey:'waterLevel',
					collapsed: true
				},
				{
					title:'Current Flow Rate',
					valueKey:'waterCurrent',
					collapsed: true
				},
				{
					title:'Run Cycles Today',
					valueKey:'runCycle',
					collapsed: true
				},
				{
					title:'Gallons Pumped Today',
					valueKey:'gallonsPumped',
					collapsed: true
				},
				{
					title:'Lifetime Run Cycles',
					valueKey:'lifetimeCycle',
					collapsed: true
				},
				{
					title:'AC Voltage',
					valueKey:'acVoltage',
					collapsed: true
				},
				{
					title:'Battery Voltage',
					valueKey:'batteryVoltage',
					collapsed: true
				},
				{
					title:'Room Temperature',
					valueKey:'roomTemperature',
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
//alert("loginData: " + loginData);
				$rootScope.makeRequest(loginData).then(
					function success(response){
//alert('$stateParams.pumpId:'+$stateParams.pumpId);
						var getData = PumpApp.Request.Builder.GetPumpById(response.data[1], $stateParams.pumpId);
						$rootScope.makeRequest(getData).then(
							function(response) {
//alert('response::::: ' + response.data[0] + ', ' + response.data[1]);

	        $scope.pumpRefresh = true;
		$scope.isFetchingDetails = false;

		if (response.data[0] === 'success') {
			PumpApp.PumpUtil.updateFromData($scope.pumpDetail, response.data[1]);
			$rootScope.selectedPump = $scope.pumpDetail;		

		};
 
	//alert('set $scope.pumpRefresh = true');
								
							},
							function error(e){
	alert('ERROR: ' + e.status);
								debugger;
							}
						);
					},
					function error(e){
	alert('ERROR: ' + e.status);
						debugger;
					}
				);
			};
			
			$scope.getPumpRetries = 0;
			$scope.getPumpDetailsInterval = $interval(function() {

/////////// 		
			    if (false) {    /// old code
				if (!$scope.pumpRefresh) {
					$scope.getPumpRetries++;
//alert('!pumpRefresh:'+$scope.getPumpRetries);
					if ($scope.getPumpRetries >= 4) {
						//alert("No pump information found! Please check your connection.");
						$interval.cancel($scope.getPumpDetailsInterval);
						$scope.getPumpDetailsInterval = null;
						$scope.pumpRefresh = false;
						$scope.isFetchingDetails = false;
					} else {
						if (!$scope.isFetchingDetails) {
							$scope.getPumpDetails();
						}
					}
				} else {
//alert('YES pumpRefresh:'+$scope.getPumpRetries);
					$interval.cancel($scope.getPumpDetailsInterval);
					$scope.getPumpDetailsInterval = null;
					$scope.pumpRefresh = false;
					$scope.isFetchingDetails = false;
				}
			    }  else { /// old code
		//alert('isFetchingDetails='+$scope.isFetchingDetails);
					if (!$scope.isFetchingDetails) {
						$scope.getPumpDetails();
					}
			    }
			},
			2000);
			
			
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
