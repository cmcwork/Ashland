(function(){
	"use strict";
	
	
	angular.module('pumpApp').controller('setupController', ['$scope', '$state', '$stateParams', '$rootScope', '$timeout', '$interval',
		function($scope, $state, $stateParams, $rootScope, $timeout, $interval) {
			$rootScope.page = 'setup';
			$rootScope.footerVisible = ($stateParams.stepId==='0');
			$rootScope.isRootBack = true;
			
			$rootScope.setupPump = $rootScope.setupPump || PumpApp.PumpUtil.create();
			
			$scope.wifiname = $rootScope.me.wifiname;
			$scope.wifipass = $rootScope.me.wifipass;
			$scope.serialPrefix = PumpApp.Constants.SerialPrefix;
			$scope.autoDetectPumpSerial = function() {
				var autoDetectfail = function (e){//declare inside the constructor locally
					$scope.autoDetectPumpSerialFailure();
				};
			
				var autoDetectsucc = function(ssid) {//declare inside the constructor locally
					$rootScope.setupPump.serialending = ssid.replace(/"/g,'');
					$scope.autoDetectPumpSerialSuccess();
					$timeout(function(){
						$rootScope.setupPump.serialending = $rootScope.setupPump.serialending;
					}, 50);
				};
			
				var succScan = function() {//declare inside the constructor locally
					$timeout(function(){
						DeviceUtility.findSSID(PumpApp.Constants.SerialPrefix+$rootScope.setupPump.serialending, autoDetectsucc, autoDetectfail);
					}, 100);
				};

				if (PumpApp.Utils.isAndroid()) {
					DeviceUtility.startScan(succScan, autoDetectfail);
					document.getElementById('pumpSerialNumber').value = $rootScope.setupPump.serialending;
				} else {  // iOS and test
					$scope.autoDetectPumpSerialFailure();
					document.getElementById('pumpSerialNumber').value = $rootScope.setupPump.serialending;
				}
				
				return true;
			};
			
			$scope.autoDetectPumpSerialSuccess = function() {
				$scope.setStatusIcon('none', 'progressSpinner');
				
				document.getElementById('actionButton').disabled = false;
			};
			
			$scope.autoDetectPumpSerialFailure = function() {
				$scope.setStatusIcon('none', 'progressSpinner');
				
				var subHeader = document.getElementById('subHeader');
				if (!!subHeader) {
					document.getElementById('subHeader').style.display = 'none';
				}
				
				var subHeaderNoAutofill = document.getElementById('subHeaderNoAutofill');
				if (!!subHeaderNoAutofill) {
					document.getElementById('subHeaderNoAutofill').style.display = 'unset';
				}
				
				document.getElementById('actionButton').disabled = false;
			};


			$scope.connectToPump = function() {
				// Validation of input must be length 6 and digits
				var pumpSNElement = document.getElementById('pumpSerialNumber');
				if (!!pumpSNElement) {
					var serialNumRegex = RegExp('^[0-9]{6}$');
					if (serialNumRegex.test(pumpSNElement.value) == false) {
						//alert('Pump serial number should be 6 digits. Invalid input: ' + pumpSNElement.value);
						$scope.performActionFailure();
						return;
					}
					
					if ($rootScope.setupPump.description.length <= 0) {
						$scope.performActionFailure();
						return;
					}
					
					$rootScope.setupPump.serialending = pumpSNElement.value;
				}
				
				var pumpConnectSuccess = function() {
					var nodeSearchData = PumpApp.Request.Builder.AppNodeSearch();
					
					$rootScope.makeRequest(nodeSearchData).then(
						function success(response){
							$rootScope.setupPump.connectiondata = response.data[1];
							$rootScope.setupPump.id = '0x0000'; //TODO: replace this with the real value...
							var getPropData = PumpApp.Request.Builder.NodePropertyGet($rootScope.setupPump.connectiondata,$rootScope.setupPump.id,'MAC');
							$rootScope.makeRequest(getPropData).then(
								function(response) {
									if (response.data[0] === 'error') {
										$scope.performActionFailure();
									}
									else {
										$rootScope.setupPump.macaddress = data[1];
										$scope.performActionSuccess();
									}
								},
								function error(e){
									debugger;
									$scope.performActionFailure();
								}
							);
						},
						function error(e){
							debugger;
							$scope.performActionFailure();
						}
					);
				};

				// Attempt to connect to pump wifi here
				$rootScope.setupPump.name = PumpApp.Constants.SerialPrefix + $rootScope.setupPump.serialending;
				if (PumpApp.Utils.isAndroid() && !PumpApp.Utils.isDemo()) { //Android
					DeviceUtility.connectNetwork($rootScope.setupPump.name, pumpConnectSuccess, $scope.performActionFailure);
				}
				else if (PumpApp.Utils.isIPhone() && !PumpApp.Utils.isDemo()) { //iOS
					DeviceUtility.iOSConnectNetwork($rootScope.setupPump.name, '', pumpConnectSuccess, $scope.performActionFailure);
				}
				else { //test
					$timeout(function(){
						if (!angular.isDefined($rootScope.pumps.length) || $rootScope.pumps.length === 0) {
							$rootScope.setupPump.id = '0x0000';
						}
						else {
							$rootScope.setupPump.id = '0x000' + ($rootScope.pumps.length);
						}
						
						$rootScope.setupPump.connectiondata = '0x58a7654df348e28f';
						$rootScope.setupPump.macaddress = 'A020A63455D5';
						$scope.performActionSuccess();
					},1000);
				}
			};
			
			$scope.savePumpInfo = function() {
				// Attempt to save the basic pump info to the pump (step 2-3)
				return true;
			};

			$scope.scanNetworks = function() {
				// Step 2-4
				// Do work here to populate table html with home wifi network list

				var scanNetworksfail = function (e){//declare inside the constructor locally
					//alert("Operation Failed!!!");
				};
			
				var scanNetworkssucc = function(n) {//declare inside the constructor locally
						//alert('succGetWiFiNetwork:'+ n.length);
						t(function(){
							//alert('succGetWiFiNetwork:setScanResults:');
							$scope.netWorks = n;
						}, 50);
					};
			
				var succStartScan = function() {//declare inside the constructor locally
					//alert('succStartScan');
					$timeout(function(){
						DeviceUtility.getScanResults(scanNetworkssucc, scanNetworksfail);
						}, 100);
					};

				if (PumpApp.Utils.isAndroid()) {
					$scope.netWorks = [];
					DeviceUtility.startScan(succStartScan, scanNetworksfail);
				} else {  // iOS
					$scope.netWorks = [ 
						{ SSID: $scope.wifiname },
						{ SSID: "WiFi 1" },
						{ SSID: "WiFi 2" },
						{ SSID: "WiFi 3" },
						{ SSID: "WiFi 4" },
						{ SSID: "WiFi 5" },
						{ SSID: "WiFi 6" },
						{ SSID: "WiFi 7" }
					];
				}
			};
			
			$scope.pumpWifiSaveCount = 0;
			$scope.pumpWifiExpectedCount = 0;
			$scope.pumpWifiSaveTimeout = null;
			$scope.watchpumpWifiSaveCount = $scope.$watch('pumpWifiSaveCount', function (newValue, oldValue, scope) {
				if ($scope.pumpWifiSaveTimeout !== null && $scope.pumpWifiSaveCount === $scope.pumpWifiExpectedCount) {
					$scope.performActionSuccess();
					if ($scope.pumpWifiSaveTimeout !== null) {
						clearTimeout($scope.pumpWifiSaveTimeout);
						$scope.pumpWifiSaveTimeout = null;
					}
				}
			}, true);
			$scope.saveWifiInfo = function() {
				// Attempt to save the wifi info to the pump (step 2-4)
				$rootScope.me.wifiname = $scope.wifiname;
				$rootScope.me.wifipass = $scope.wifipass;

				// Connect to selected wifi network using the network and password alerted above
				$scope.pumpWifiSaveTimeout = setTimeout(function() {
					$scope.performActionFailure();
				}, 30000);
				
				var failureCase = function() {
					clearTimeout($scope.pumpWifiSaveTimeout);
					$scope.pumpWifiSaveTimeout = null;
					$scope.performActionFailure();
				};
				
				var propsToSet = [
					{key:'Name', value:$rootScope.setupPump.name},
					{key:'Description', value:$rootScope.setupPump.description},
					{key:'Zip', value:$rootScope.me.zipcode},
					{key:'Email', value:$rootScope.me.email},
					{key:'Time', value:moment().toString()},
					{key:'SSID', value:$rootScope.me.wifiname},
					{key:'password', value:$rootScope.me.wifipass},
				];
				
				var locationCallback = function(locationString) {
					propsToSet.push({key:'GPS', value:locationString});
					$scope.setPumpProperties(propsToSet);
				};
				
				if ($rootScope.me.allowlocation === true) {
					$scope.getGPSLocation(locationCallback);
				}
				else {
					propsToSet.push({key:'GPS', value:''});
					$scope.setPumpProperties(propsToSet);
				}
			};
			
			$scope.setPumpProperties = function(props) {
				$scope.pumpWifiExpectedCount = props.length;
				for (var i = 0; i < $scope.pumpWifiExpectedCount; i++) {
					if (!PumpApp.Utils.isDemo()) {
						var nodeSetPropertyData = PumpApp.Request.Builder.NodePropertySet($rootScope.setupPump.connectiondata, $rootScope.setupPump.id, props[i].key, props[i].value);
						$rootScope.makeRequest(nodeSetPropertyData).then(
							function success(response){
								if (response.data[0] === 'error') {
									failureCase();
								}
								else {
									$scope.pumpWifiSaveCount++;
								}
							},
							function error(e){
								failureCase();
							}
						);
					}
					else {
						$timeout(function(){
							$scope.pumpWifiSaveCount++;
						}, 300);
					}
				}
			};
			
			$scope.getGPSLocation = function(successCallback) {
				if (PumpApp.Utils.isPhone()) {
					navigator.geolocation.getCurrentPosition(
						function(positionRaw) {
							successCallback(positionRaw.coords.latitude + ',' + positionRaw.coords.longitude);
						},
						function(error) {
							console.error('code: ' + error.code + '\n' + 'message: ' + error.message);
							successCallback('');
						},
						{ timeout: 30000 }
					);
				}
				else {
					successCallback('41.8336479,-87.872046');
				}
			};
			
			$scope.enablePumpWifiSuccess = function() {
				$scope.setStatusIcon('fa-check', 'progressSpinner');
				
				$timeout(function(){
					$scope.goToSetupPage(26);
				},300);
			};
			
			$scope.enablePumpWifiFailure = function() {
				$scope.setStatusIcon('fa-times', 'progressSpinner');
				
				var failureText = document.getElementById('failureText');
				if (!!failureText) {
					document.getElementById('failureText').style.display = 'unset';
				}
				
				var backButton = document.getElementsByClassName('backButton')[0];
				if (!!backButton) {
					document.getElementsByClassName('backButton')[0].setAttribute('ng-click', 'goToSetupPage(21)');
				}
				
				var doubleBackButton = document.getElementsByClassName('doubleBackButton')[0];
				if (!!doubleBackButton) {
					document.getElementsByClassName('doubleBackButton')[0].style.display = 'unset';
				}
				
				document.getElementById('actionButton').disabled = false;
			};
			
			$scope.enablePumpWifi = function() {
				document.getElementById('actionButton').disabled = true;
				$scope.setStatusIcon('progressSpinner', 'fa-check');
				$scope.setStatusIcon('progressSpinner', 'fa-times');
				function connSuc(e) {
					//alert("Con Suc: " + $rootScope.currentSSID);
					$scope.enablePumpWifiSuccess();
				};
				function confail(e) {
					//alert("Con Fail: " + $rootScope.currentSSID);
					$scope.enablePumpWifiFailure();
				};
				// Actions to do:
				// 1. Restart pump
				var resetCommandSuccess = function() {
					// 2. Connect phone to home wifi network (if phone wifi connection succeeds to home network return TRUE, else FALSE)
					//alert('Selected Network: ' + $rootScope.me.wifiname);
					//alert('Network Password: ' + $rootScope.me.wifipass);
					if (PumpApp.Utils.isAndroid()) {
						DeviceUtility.connectNetwork($rootScope.me.wifiname, connSuc, confail);
					}
					else if (PumpApp.Utils.isIPhone()) { //iOS
						DeviceUtility.iOSConnectNetwork($rootScope.me.wifiname, $rootScope.me.wifipass, connSuc, confail);
					}
					else {
						$timeout(function(){
							connSuc();
						},500);
					}
				};
				
				if (!PumpApp.Utils.isDemo()) {
					var resetCommandData = PumpApp.Request.Builder.ExecuteCommand($rootScope.setupPump.connectiondata, $rootScope.setupPump.id, 'soft reset 65529');
					$rootScope.makeRequest(resetCommandData).then(
						function success(response){
							if (response.data[0] === 'error') {
								$scope.enablePumpWifiFailure();
							}
							else {
								resetCommandSuccess();
							}
						},
						function error(e){
							failureCase();
						}
					);
				}
				else {
					resetCommandSuccess();
				}
			};
			
			$scope.enablePhoneNotifications = function() {
				// Attempt to enable phone notifications for this phone for the pump
				var enableNotificationsSuccess = function() {
					$rootScope.savePump($rootScope.setupPump);
					$scope.goToSetupPage(34);
				};
				
				if (PumpApp.Utils.isDemo()) {
					$timeout(function(){
						enableNotificationsSuccess();
					},400);
				}
				else {
					var phoneIdentity = $rootScope.me.appTokenId + ':' + $rootScope.me.name;
					var nodeSetPropertyData = PumpApp.Request.Builder.NodePropertySet($rootScope.setupPump.connectiondata, $rootScope.setupPump.id, 'tokenid', phoneIdentity);
					$rootScope.makeRequest(nodeSetPropertyData).then(
						function success(response){
							if (response.data[0] === 'success') {
								var addListData = PumpApp.Request.Builder.ExecuteCommand($rootScope.setupPump.connectiondata, $rootScope.setupPump.id, 'add to list');
								$rootScope.makeRequest(addListData).then(
									function success(response){
										if (response.data[0] === 'success') {
											enableNotificationsSuccess();
										}
										else {
											$scope.performActionFailure();
										}
									},
									function error(e){
										$scope.performActionFailure();
									}
								);
							}
							else {
								$scope.performActionFailure();
							}
						},
						function error(e){
							$scope.performActionFailure();
						}
					);
				}
			};
			
			$scope.performAction = function(actionFunc) {
				// Disable connect button and show progress spinner icon while attempting to connect
				document.getElementById('actionButton').disabled = true;
				$scope.setStatusIcon('progressSpinner', 'fa-check');
				$scope.setStatusIcon('progressSpinner', 'fa-times');
				
				// Perform action here such as connectToPump, etc
				actionFunc();
			};
			
			$scope.performActionSuccess = function() {
				$scope.setStatusIcon('fa-check', 'progressSpinner');
				
				var successText = document.getElementById('successText');
				if (!!successText) {
					document.getElementById('successText').style.display = 'unset';
				}
				
				var failureText = document.getElementById('failureText');
				if (!!failureText) {
					document.getElementById('failureText').style.display = 'none';
				}
				
				// Show next button
				document.getElementById('nextButton').style.display = 'unset';
			};
			
			$scope.performActionFailure = function() {
				$scope.setStatusIcon('fa-times', 'progressSpinner');
				
				var failureText = document.getElementById('failureText');
				if (!!failureText) {
					document.getElementById('failureText').style.display = 'unset';
				}
				
				var successText = document.getElementById('successText');
				if (!!successText) {
					document.getElementById('successText').style.display = 'none';
				}
				
				document.getElementById('actionButton').disabled = false;
			};
			
			$scope.setStatusIcon = function(showClass, hideClass) {
				if (!!document.getElementsByClassName(hideClass)[0]) {
					document.getElementsByClassName(hideClass)[0].style.display = 'none';
				}
				
				if (!!document.getElementsByClassName(showClass)[0]) {
					document.getElementsByClassName(showClass)[0].style.display = 'unset';
				}
			};
			
			$scope.resizeSetupScreen = function() {
				document.getElementsByClassName('setup-app')[0].style.height = (document.body.scrollHeight * 0.83) + 'px';
			};
			
			$scope.makeTableScroll = function() {
				var maxRows = 5;

				var table = document.getElementById('networkList');
				var wrapper = table.parentNode;
				var rowsInTable = table.rows.length;
				var height = 0;
				if (rowsInTable > maxRows) {
					for (var i = 0; i < maxRows; i++) {
						height += table.rows[i].clientHeight;
					}
					wrapper.style.height = height + "px";
				}
			};
			
			$scope.togglePassword = function(toggle) {
				if (toggle) {
					document.getElementById('networkAccess').setAttribute('type','text');
					document.getElementById('passwordIconShow').style.display = 'none';
					document.getElementById('passwordIconHide').style.display = 'unset';
				}
				else {
					document.getElementById('networkAccess').setAttribute('type','password');
					document.getElementById('passwordIconHide').style.display = 'none';
					document.getElementById('passwordIconShow').style.display = 'unset';
				}
			};
			
			$scope.handleNetworkListClick = function($event, item) {
				var oldSelection = angular.element(document.querySelector('.networkList .selected'));
				oldSelection.removeClass('selected');
				var el = (function(){
					var elem = $event.currentTarget || $event.srcElement;
					if (elem.nodeName === 'TR') {
						return angular.element(elem.children[0]); // get td
					} else {
						return angular.element(elem);          // is td
					}
				})();
				el.addClass('selected');
				
				$scope.wifiname = item.SSID;
			};
			
			$scope.stopAniLeafCycle = null;
			$scope.aniLeafCycleStep = 1;
			$scope.startAniLeafCycle = function() {
				$scope.stopAniLeafCycle = $interval(function() {
					$scope.aniLeafCycleStep++;
					if($scope.aniLeafCycleStep > 3) {
						$scope.aniLeafCycleStep = 1;
					}
				}, 3000);
			}
			
			$scope.goToSetupPage = function(n) {
				$rootScope.navigateToPage($rootScope.page, {stepId:n});
			};
			
			$scope.setupStatusHelp = function() {
				debugger;
			}
			
			$scope.restartPumpHelp = function () {
				debugger;
			}
			
			$scope.$on("$destroy",
				function() {
					$('.view').css('background-color','');
					$('.footerMiddle').css('background-color','');
					if ($scope.pumpWifiSaveTimeout !== null) {
						clearTimeout($scope.pumpWifiSaveTimeout);
					}
					
					if ($scope.watchpumpWifiSaveCount !== null && $scope.watchpumpWifiSaveCount !== undefined) {
						$scope.watchpumpWifiSaveCount();
					}
					
					if ($scope.stopAniLeafCycle !== null) {
						$interval.cancel($scope.stopAniLeafCycle);
						$scope.stopAniLeafCycle = null;
					}
				}
			);
			
			$rootScope.createMenu([]);
			
			$('.view').css('background-color','white');
			$('.footerMiddle').css('background-color','white');
	}]);
})();