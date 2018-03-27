(function(){
	"use strict";
	
	angular.module('pumpApp').controller('pumpsController', ['$scope', '$state', '$rootScope', '$http', '$interval',
		function($scope, $state, $rootScope, $http, $interval) {
			$rootScope.page = 'pumps';
			$rootScope.footerVisible = true;
			$rootScope.isRootBack = true;
			
			$scope.pumpsRefresh = false;
			//$rootScope.pumps = [];
			$rootScope.selectedPump = null;
			$scope.getPumpRetries = 0;
			$scope.getPumpInterval = null;
			$scope.waitingForPumps = false;
			
			if (!angular.isDefined($rootScope.pumps.length)) {
				$rootScope.pumps = [];
			}
			
			/*$scope.pumpsSyncedCount = 0;
			$scope.watchPumpsSyncedCount = $scope.$watch('pumpsSyncedCount', function (newValue, oldValue, scope) {
				if (oldValue===newValue) {
					return;
				}
				if ($scope.pumpsSyncedCount === $rootScope.pumps.length) {
					$scope.waitingForPumps = false;
				}
				else {
					$scope.getPumpDetails($scope.pumpsSyncedCount);
				}
			}, true);*/
			
			$scope.getPumpList = function() {
			if (PumpApp.Utils.isDemo20180322()) { // For 3/22/2018 demo
				if ($rootScope.pumps.length > 0) {
					$scope.waitingForPumps = true;
					$scope.getPumpDetails(0);
				} // end of if
			else {
				var loginData = PumpApp.Request.Builder.Login();
				$rootScope.makeRequest(loginData).then(
					function success(response){
						var getData = PumpApp.Request.Builder.GetAllPumps(response.data[1]);
						$rootScope.makeRequest(getData).then(
							function(response) {
								$rootScope.pumps = $scope.processRawPumps(response.data[1]);
								$scope.pumpsRefresh = true;
								$scope.waitingForPumps = false;
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
			     } // end of else
			};
			
			$scope.getPumpDetails = function(pumpIndex) {
				var loginData = PumpApp.Request.Builder.Login();

				$rootScope.makeRequest(loginData).then(
					function success(response){
						var getData = PumpApp.Request.Builder.GetPumpById(response.data[1], $rootScope.pumps[pumpIndex].id);
						$rootScope.makeRequest(getData).then(
							function(response) {
								PumpApp.PumpUtil.updateFromData($rootScope.pumps[pumpIndex], response.data[1]);
								$scope.pumpsSyncedCount++;
							},
							function error(e){
								$scope.pumpsSyncedCount++;
								debugger;
							}
						);
					},
					function error(e){
						$scope.pumpsSyncedCount++;
						debugger;
					}
				);
			};
			
			/*$scope.getPumpInterval = $interval(function() {
				if (!$scope.waitingForPumps) {
					$scope.getPumpList();
				}
				
				if (!$scope.pumpsRefresh) {
					$scope.getPumpRetries++;
					if ($scope.getPumpRetries >= 4) {
						alert("No pump found! Please setup your pump.");
						$interval.cancel($scope.getPumpInterval);
						$scope.getPumpInterval = null;
						$scope.pumpsRefresh = false;
						$scope.waitingForPumps = false;
					} 
				} else {
					$interval.cancel($scope.getPumpInterval);
					$scope.getPumpInterval = null;
					$scope.pumpsRefresh = false;
					$scope.waitingForPumps = false;
				}
			},
			1000);*/
			
			$scope.processRawPumps = function(rawPumps) {
				var newPumps = [];
				for (var i = 0; i < rawPumps.length; i++) {
					var newPump = PumpApp.PumpUtil.createFromData(rawPumps[i]);
					newPumps.push(newPump);
				}
				return newPumps;
			};
			
			$scope.gotoPumpDetails = function(pump) {
				$rootScope.selectedPump = pump;
				$rootScope.navigateToPage('pumpdetails', { pumpId:pump.id });
			};
			
			$scope.gotoPumpMessages = function(pump) {
				$rootScope.selectedPump = pump;
				$rootScope.navigateToPage('messages');
			};
			
			$scope.getAllPumpStatus = function() {
				var errorCount = 0;
				for (var i = 0; i < $rootScope.pumps.length; i++) {
					if ($rootScope.pumps[i].error !== '') {
						errorCount++;
					}
				}
				
				if (errorCount === 1) {
					return errorCount+' pump has an alarm';
				}
				else if (errorCount > 1) {
					return errorCount+' pumps have an alarm';
				}
				
				return 'All normal';
			};
			
			$scope.$on("$destroy",
				function() {
					if ($scope.getPumpInterval !== null) {
						$interval.cancel($scope.getPumpInterval);
					}
					if ($scope.watchPumpsSyncedCount !== null && $scope.watchPumpsSyncedCount !== undefined) {
						$scope.watchPumpsSyncedCount();
					}
				}
			);
			
			$scope.getPumpList();
			
			$scope.scanSuccess = function(result) {
				$scope.$apply(function(){
					$rootScope.clearScanState();
				});
				alert("We got a barcode\n" +
					"Result: " + result.text + "\n" +
					"Format: " + result.format + "\n" +
					"Cancelled: " + result.cancelled);
			};
			
			$scope.scanError = function(error) {
				alert("Scanning failed: " + error);
			};
			
			$rootScope.createMenu([
				{
					icon:'fas fa-search',
					title:'Scan',
					callback:$rootScope.scan,
					args:{
						page:'pumps',
						success:$scope.scanSuccess,
						error:$scope.scanError
					}
				}
			]);
	}]);
})();
