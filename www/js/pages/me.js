(function(){
	"use strict";
	
	angular.module('pumpApp').controller('meController', ['$scope', '$state', '$rootScope', '$timeout',
		function($scope, $state, $rootScope, $timeout) {
			$rootScope.page = 'me';
			$rootScope.footerVisible = true;
			$rootScope.isRootBack = true;
			
			$scope.showScanning = false;
			$scope.editingItem = null;
			$scope.editingTextInput = null;
			
			$scope.editMe = function(item) {
				if (item.name === 'wifiname') {
					return;
				}
				
				$rootScope.isRootBack = false;
				$scope.editingItem = item;
				$rootScope.rootBackFunc = $scope.meEditBack;
				$rootScope.footerVisible = false;
				$rootScope.page = 'edit';
				
				$scope.allowSave = true;
				if ($scope.editingItem.showCheckbox) {
					if ($scope.editingItem.name === 'wifipass') {
						$scope.editingTextInput = $rootScope.me[$scope.editingItem.name];
						$scope.editingCheckboxInput = $rootScope.me[$scope.editingItem.name+'exists'];
					}
					else {
						if ($rootScope.me[$scope.editingItem.name] === null) {
							$scope.editingCheckboxInput = true;
						}
						else {
							$scope.editingCheckboxInput = $rootScope.me[$scope.editingItem.name];
						}
					}
				}
				else {
					$scope.editingTextInput = $rootScope.me[$scope.editingItem.name];
				}
				
				$timeout(function() {
					$('#meEditInputTextbox').focus();
				});
			};
			
			$scope.allowSave = true;
			$scope.typeEdit = function() {
				if ($('#meEditInputTextbox').val().length > $scope.editingItem.maxlength) {
					$scope.allowSave = false;
				}
				else {
					$scope.allowSave = true;
				}
			};
			
			$scope.saveEdit = function() {
				if (!$scope.allowSave) {
					return;
				}
				
				if ($scope.editingItem.showCheckbox) {
					if ($scope.editingItem.name === 'wifipass') {
						$rootScope.me[$scope.editingItem.name] = $scope.editingTextInput;
						$rootScope.me[$scope.editingItem.name+'exists'] = $scope.editingCheckboxInput;
					}
					else {
						$rootScope.me[$scope.editingItem.name] = $scope.editingCheckboxInput;
					}
				}
				else {
					$rootScope.me[$scope.editingItem.name] = $scope.editingTextInput;
				}
				
				$scope.clearEditState();
			}
			
			$scope.clearEditValues = function() {
				$scope.editingItem = null;
				$scope.editingTextInput = null;
			};
			
			$scope.clearEditState = function() {
				$scope.clearEditValues();
				$rootScope.isRootBack = true;
				$rootScope.rootBackFunc = $rootScope.masterRootBack;
				$rootScope.footerVisible = true;
				$rootScope.page = 'me';
			};
			
			$scope.meEditBack = function() {
				$scope.clearEditState();
			};
			
			$scope.scan = function() {
				$rootScope.scan();
			};
			
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
			
			$scope.editOptions = [
				{
					name:'name',
					title:'Phone Name',
					showCheckbox:false,
					maxlength:20
				},
				{
					name:'email',
					title:'Email',
					showCheckbox:false,
					maxlength:30
				},
				{
					name:'zipcode',
					title:'Zip Code',
					showCheckbox:false,
					maxlength:5
				},
				{
					name:'allowlocation',
					title:'Allow Location',
					showCheckbox:true,
					checkboxText:'Allow app to use your GPS location?',
					maxlength:1
				},
				{
					name:'wifiname',
					title:'Home WiFi Name',
					showCheckbox:false,
					maxlength:30
				},
				{
					name:'wifipass',
					title:'Home WiFi Password',
					showCheckbox:true,
					checkboxText:'No password?',
					maxlength:30
				}
			];
			
			$rootScope.createMenu([
				{
					icon:'fas fa-search',
					title:'Scan',
					callback:$rootScope.scan,
					args:{
						page:'me',
						callback:$scope.clearEditState,
						success:$scope.scanSuccess,
						error:$scope.scanError
					}
				},
				{
					icon:'fas fa-info-circle',
					title:'About',
					callback:$scope.scan,
					args:{
						page:'me',
						callback:$scope.clearEditState
					}
				}
			]);
	}]);
})();