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
//alert('$rootScope.me.deviceuuid: ' + $rootScope.me.deviceuuid);
				var autoDetectfail = function (e){//declare inside the constructor locally
					$scope.autoDetectPumpSerialFailure();
				};
			
				var autoDetectsucc = function(ssid) {//declare inside the constructor locally
				var serialNo = ssid.replace(/"/g,'');

		alert('Auto-Detect Found ['+serialNo+']');

            $scope.$apply(function() {
				$rootScope.setupPump.serialending = serialNo;
            });
					$scope.autoDetectPumpSerialSuccess();
				};
			
				var succScan = function() {//declare inside the constructor locally
alert('For Android only: Try to Auto-Detect ['+PumpApp.Constants.SerialPrefix+'] in the WiFi scan list');
					$timeout(function(){
						DeviceUtility.findSSID(PumpApp.Constants.SerialPrefix, autoDetectsucc, autoDetectfail);
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
				$timeout(function(){
					$rootScope.setupPump.serialending = $rootScope.setupPump.serialending;
				}, 100);
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
				// Validation of input must be length 4 and digits

//cordova.plugins.email.open({
//    to:      'cccfmc2018@gmail.com',
//    cc:      'mchen60047@gmail.com',
//    subject: 'Nexus6 FCM Token',
//    body:    $rootScope.me.fcmtoken
//});


				var pumpSNElement = document.getElementById('pumpSerialNumber');
				if (!!pumpSNElement) {
					var serialNumRegex = RegExp('^[0-9]{4}$');
					if (serialNumRegex.test(pumpSNElement.value) == false) {
						alert('Pump serial number should be 4 digits. Invalid input: ' + pumpSNElement.value);
						$scope.performActionFailure();
						return;
					}
					
					if ($rootScope.setupPump.description.length <= 0) {
						$scope.performActionFailure();
						return;
					}
					
					$rootScope.setupPump.serialending = pumpSNElement.value;
				}
				
//alert('>>>1');
				var pumpConnectSuccess = function() {
alert('pumpConnectSuccess: Wait 2 seconds to get the connected SSID');
	var keepGoing = false;
	$timeout(function(){
		DeviceUtility.getCurrentSSID(
		function (s){
			$rootScope.unverifiedSSID = s.replace(/"/g,'');
	alert('pumpConnectSuccess::unverifiedSSID: '+$rootScope.unverifiedSSID);
			if ($rootScope.setupPump.name.length > 0 && $rootScope.setupPump.name === $rootScope.unverifiedSSID) {
				keepGoing = true;
			}
		}, {});
	}, 2000);  // TIMER
				    if (PumpApp.Utils.isDemo20180322()) {
				    //if (false) {
///////// Connect to the Pump directly /////////////////////////////////
//alert('pumpConnectSuccess: tryint to get IPAddress');

alert('pumpConnectSuccess: Wait 5 seconds to open the socket');

				$timeout(function(){
				// wait for 5 seconds to open socket
				if (keepGoing !== true) { 
//alert('keepGoing is FALSE');
	alert('Current SSID ['+$rootScope.unverifiedSSID+'] != Pump SSID ['+$rootScope.setupPump.name+']');

					if (PumpApp.Utils.isAndroid()) {
						$scope.openWifiSettings();
					}
					$scope.performActionFailure();
					return;
				};
$scope.bSuccess = false;
var params = {};
alert('pumpConnectSuccess: Trying to get IPAddress. Plugin API may take a while to return!!!');
addressimpl.request("getIPAddress", JSON.stringify(params), 
    function(ip) {
    	alert("Succesfully getIPAddress ["+ip+']');
    }, function() {
    	alert("Failed on get ip address!!!");
    });


					var socket = new Socket();
					var cmd = "";
					var closeSocket = false;
					socket.onData = function(data) {
					  // invoked after new batch of data is received (typed array of bytes Uint8Array)
						var dataString = new TextDecoder("utf-8").decode(data);
						dataString = dataString.replace('\r\n','');
			alert("RESPONSE:" + dataString);
						if (dataString.includes(cmd)) {
							switch(cmd) {
							    case "Connect":
								var substr = dataString.substring(cmd.length+1).split(":", 2); // MAC:id
            					$rootScope.$apply(function() {
								$rootScope.setupPump.macaddress = substr[0];
					//$rootScope.setupPump.id =$rootScope.normalizePumpIdentity(substr[1]);
					$rootScope.setupPump.id =$rootScope.convertPumpIdentity(substr[1]);
            					});
	alert('macaddress:' + $rootScope.setupPump.macaddress + ', id:' + $rootScope.setupPump.id); 
								closeSocket = true;
								$scope.bSuccess = true;
							        $scope.performActionSuccess();
								break;
							    default:
								closeSocket = true;
//alert('>>>>> 1 <<<<<<<<<$scope.performActionFailure()');
							$scope.performActionFailure();
								break;
							}
						}
						if (closeSocket) {
alert('Closing Socket...');
							$timeout(function(){
								socket.close();
							}, 200);

						}
					};

					socket.onError = function(errorMessage) {
						if (!closeSocket) {
						  alert('Socket Connection Error: ' + errorMessage);
						  if (!$scope.bSuccess) {
//alert('>>>>> 2 <<<<<<<<<$scope.performActionFailure()');		
							$scope.performActionFailure();
						  }
						}
					  // invoked after error occurs during connection
					};
					socket.onClose = function(hasError) {
			alert('Connection Closed: ' + hasError);
						//if (hasError) alert('Connection Closed: ' + hasError);
					  // invoked after connection close
					};


alert('trying to connect to ' + PumpApp.Constants.PumpApIpAddress + ':' + PumpApp.Constants.PumpApPortNo);
//alert('$rootScope.me.deviceuuid: ' + $rootScope.me.deviceuuid);
					socket.open( PumpApp.Constants.PumpApIpAddress, PumpApp.Constants.PumpApPortNo,
					  function() {
						alert('Opening socket: Successful');
					    // invoked after successful opening of socket
						// Try to CONNECT to Pump
						cmd = "Connect";
var tmp3 = "connect " + $rootScope.me.deviceuuid + "\r\n";
alert(tmp3);
						socket.write(PumpApp.Utils.formatUint8Array
							("connect " + $rootScope.me.deviceuuid + "\r\n"));
					  },
					  function(errorMessage) {
						alert('Opening socket: Faield: ' + errorMessage);
//alert('>>>>> 3 <<<<<<<<<$scope.performActionFailure()');
						$scope.performActionFailure();
					    // invoked after unsuccessful opening of socket
					  }
					);
				}, 5000);  // TIMER
				

////////////////////////////////////////////////////////////////////////

				    } else {  // try to query MAC address
					var nodeSearchData = PumpApp.Request.Builder.AppNodeSearch();
					
					$rootScope.makeRequest(nodeSearchData).then(
						function success(response){
							$rootScope.setupPump.connectiondata = response.data[1];
							$rootScope.setupPumpgetCurrentSSID.id = '0x0000'; //TODO: replace this with the real value...
							var getPropData = PumpApp.Request.Builder.NodePropertyGet($rootScope.setupPump.connectiondata,$rootScope.setupPump.id,'MAC');
							$rootScope.makeRequest(getPropData).then(
								function(response) {
									if (response.data[0] === 'error') {
//alert('>>>>> 4 <<<<<<<<<$scope.performActionFailure()');
			$scope.performActionFailure();
									}
									else {
										$rootScope.setupPump.macaddress = data[1];
										$scope.performActionSuccess();
									}
								},
								function error(e){
//alert('>>>>> 5 <<<<<<<<<$scope.performActionFailure()');
								$scope.performActionFailure();
									debugger;
								}
							);
						},
						function error(e){
//alert('>>>>> 6 <<<<<<<<<$scope.performActionFailure()');
							$scope.performActionFailure();
							debugger;
						}
					);
				    }
				}; // End of pumpConnectSuccess


				var pumpConnectFailed = function() {
					alert('pumpConnectFailure');
					if (PumpApp.Utils.isAndroid()) {
						$scope.openWifiSettings();
					}
//alert('>>>>> 7 <<<<<<<<<$scope.performActionFailure()');
					$scope.performActionFailure();
				};

				// Attempt to connect to pump wifi here
				$rootScope.setupPump.name = PumpApp.Constants.SerialPrefix + $rootScope.setupPump.serialending;
//alert('>>>2: ' + $rootScope.setupPump.name);
				if (PumpApp.Utils.isAndroid() && !PumpApp.Utils.isDemo()) { //Android
					alert('Trying to connectNetwork ['+ $rootScope.setupPump.name+']');
					  try {   
						var config = DeviceUtility.formatWPAConfig($rootScope.setupPump.name, "");
						DeviceUtility.addNetwork(config, function() {
				//alert('addNetwork OK');
					DeviceUtility.connectNetwork($rootScope.setupPump.name, pumpConnectSuccess, pumpConnectFailed);
						});             
					    }
					    catch(err) {
						//alert("Plugin Error - " + err.message);
					//alert('Connect back: '+$rootScope.me.wifiname);
						DeviceUtility.connectNetwork($rootScope.me.wifiname,{}, {});
					   }
				}
				else if (PumpApp.Utils.isIPhone() && !PumpApp.Utils.isDemo()) { //iOS
					DeviceUtility.iOSConnectNetwork($rootScope.setupPump.name, '', pumpConnectSuccess, $scope.performActionFailure);
				}
				else { //test
//alert('WHY HERE????');
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
//alert('savePumpInfo');

				// Attempt to save the basic pump info to the pump (step 2-3)
				return true;
			};

			$scope.scanNetworks = function() {

//// Need to change to get scanned network from PUMP
				// Step 2-4
				// Do work here to populate table html with home wifi network list

				var scanNetworksfail = function (e){//declare inside the constructor locally
					//alert("Operation Failed!!!");
					if (PumpApp.Utils.isAndroid()) {
						$scope.openWifiSettings();
					}
				};
			
				var scanNetworkssucc = function(n) {//declare inside the constructor locally
						//alert('succGetWiFiNetwork:'+ n.length+', n='+n);
///
//n.forEach(function(message, index) {
    //alert('message index '+ index);
//    Object.keys(message).forEach(function(prop) {    
//        alert(prop + " = " + message[prop]);
//    });
//});
						    $scope.$apply(function() {
						      $scope.netWorks = n;
						    });
					};
			
				var succStartScan = function() {//declare inside the constructor locally
					//alert('succStartScan');
					$timeout(function(){
						DeviceUtility.getScanResults(scanNetworkssucc, scanNetworksfail);
						}, 100);
					};

				if (PumpApp.Utils.isAndroid()) {
					$scope.netWorks = [];
					DeviceUtility.startScan(succStartScan, scanNetworksfail)

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
			
			$scope.openWifiSettings = function() {
				if (window.cordova && window.cordova.plugins.settings) {
					console.log('openSettingsTest is active');
					window.cordova.plugins.settings.open("wifi", 
						function() {
							console.log('opened settings');
						},
						function () {
							console.log('failed to open settings');
						}
					);
				} else {
					console.log('openSettingsTest is not active!');
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
//alert('>>>>> 8 <<<<<<<<<$scope.performActionFailure()');
					$scope.performActionFailure();
				}, 30000);
				
				var failureCase = function() {
					clearTimeout($scope.pumpWifiSaveTimeout);
					$scope.pumpWifiSaveTimeout = null;
//alert('>>>>> 9<<<<<<<<<$scope.performActionFailure()');
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
//alert('HERE to get Location');					
					propsToSet.push({key:'GPS', value:''});
					$scope.setPumpProperties(propsToSet);
/////Comment out for now ///////////////
					//$scope.getGPSLocation(locationCallback);

				}
				else {
					propsToSet.push({key:'GPS', value:''});
					$scope.setPumpProperties(propsToSet);
				}
			};
			
			$scope.setPumpProperties = function(props) {
			    if (PumpApp.Utils.isDemo20180322()) {
/////////////////////////////////////
alert('Saving WiFi info to Pump...');
				var socket = new Socket();
				var cmd = "";
				var closeSocket = false;
				socket.onData = function(data) {
				  // invoked after new batch of data is received (typed array of bytes Uint8Array)
					var dataString = new TextDecoder("utf-8").decode(data);
					dataString = dataString.replace('\r\n','');
		alert("RESPONSE:" + dataString);
					if (dataString.includes(cmd)) {
						if (dataString.includes("OK")) {
						    switch(cmd) {
							case "ssid":
							    if ($rootScope.me.wifipass.length) {
								cmd = "pwd";
var tmp2 = cmd + " " + $rootScope.me.wifipass + "\r\n";
alert(tmp2);
								socket.write(PumpApp.Utils.formatUint8Array
									(cmd + " " + $rootScope.me.wifipass + "\r\n"));
							    } else {
					  		    	closeSocket = true;
							    }
							    break;
							case "pwd":
							    closeSocket = true;
							    $scope.performActionSuccess();
							    break;
							default:
					  		    closeSocket = true;
//alert('>>>>> 10 <<<<<<<<<$scope.performActionFailure()');
$scope.performActionFailure();
							    break;
						    }
						}
					}
					if (closeSocket) {
alert('Closing Socket...');
						$timeout(function(){
							socket.close();
						}, 200);

					}
				};

				socket.onError = function(errorMessage) {
					if (!closeSocket) {
					  alert('Connection Error: ' + errorMessage);
//alert('>>>>> 11 <<<<<<<<<$scope.performActionFailure()');
					  $scope.performActionFailure();
					}
				  // invoked after error occurs during connection
				};
				socket.onClose = function(hasError) {
					alert('Connection Closed: ' + hasError);
					//if (hasError) alert('Connection Closed: ' + hasError);
				  // invoked after connection close
				};


alert('trying to connect to ' + PumpApp.Constants.PumpApIpAddress + ':' + PumpApp.Constants.PumpApPortNo);
//alert('$rootScope.me.deviceuuid: ' + $rootScope.me.deviceuuid);
				socket.open( PumpApp.Constants.PumpApIpAddress, PumpApp.Constants.PumpApPortNo,
				  function() {
					alert('Opening socket: Successful');
				    // invoked after successful opening of socket
					// Try to CONNECT to Pump
					cmd = "ssid";
					var tmp = cmd + " " + $rootScope.me.wifiname + "\r\n";
					alert(tmp);
					socket.write(PumpApp.Utils.formatUint8Array(cmd + " " + $rootScope.me.wifiname + "\r\n"));
				  },
				  function(errorMessage) {
					alert('Opening socket: Faield: ' + errorMessage);
//alert('>>>>> 12 <<<<<<<<<$scope.performActionFailure()');
					$scope.performActionFailure();
				    // invoked after unsuccessful opening of socket
				  }
				);

////////////////////////////////////
			    } else {
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
	alert('resetCommandSuccess::: connectNetwork back to ['+$rootScope.me.wifiname+']');
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
				    if (PumpApp.Utils.isDemo20180322()) {
///////// Connect to the Pump directly /////////////////////////////////
				var socket = new Socket();
				var cmd = "";
				var closeSocket = false;
				socket.onData = function(data) {
				  // invoked after new batch of data is received (typed array of bytes Uint8Array)
					var dataString = new TextDecoder("utf-8").decode(data);
					dataString = dataString.replace('\r\n','');
		alert("RESPONSE:" + dataString);
					if (dataString.includes(cmd)) {
			  		    closeSocket = true;
					}
					if (closeSocket) {
alert('Closing Socket...');
						$timeout(function(){
							socket.close();
					    	resetCommandSuccess();  // closeSocket with RESPONSE
						}, 200);

					}
				};

				socket.onError = function(errorMessage) {
					if (!closeSocket) {
					  alert('Connection Error: ' + errorMessage);
					  $scope.enablePumpWifiFailure();
					}
				  // invoked after error occurs during connection
				};
				socket.onClose = function(hasError) {
				if (!closeSocket) {
			    	resetCommandSuccess();  // closeSocket with NO RESPONSE
					closeSocket = true;
				}
				alert('Connection Closed: ' + hasError);
					//if (hasError) alert('Connection Closed: ' + hasError);
				  // invoked after connection close
				};
alert('trying to connect to ' + PumpApp.Constants.PumpApIpAddress + ':' + PumpApp.Constants.PumpApPortNo);
//alert('$rootScope.me.deviceuuid: ' + $rootScope.me.deviceuuid);
				socket.open( PumpApp.Constants.PumpApIpAddress, PumpApp.Constants.PumpApPortNo,
				  function() {
					alert('Opening socket: Successful');
				    // invoked after successful opening of socket
				        cmd = "soft reset 65529\r\n";
alert(cmd);
					socket.write(PumpApp.Utils.formatUint8Array(cmd));
					$timeout(function(){
						if (!closeSocket) {  // TIMEOUT !closeSocket with NO RESPONSE
							socket.close();
					    	resetCommandSuccess();
							closeSocket = true;
						}
					}, 5000);
				  },
				  function(errorMessage) {
					alert('Opening socket: Faield: ' + errorMessage);
					$scope.enablePumpWifiFailure();
				    // invoked after unsuccessful opening of socket
				  }
				);
////////////////////////////////////////////////////
				    } else {
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
				}
				else {
					resetCommandSuccess();
				}
			};
////ProgressBar
////ProgressBar
			$scope.progressBarCurrent = 0;
			$scope.progressBarTotal = 256;  // 256 later
////ProgressBar
			$scope.updateProgressBar = function(newCurrent) {
				$scope.progressBarCurrent = newCurrent;
			};
			$scope.incrementProgressBar = function() {
//alert('incrementProgressBar');
				$scope.progressBarCurrent++;
			};
			$scope.watchprogressBarCurrent = $scope.$watch('progressBarCurrent', function (newValue, oldValue, scope) {
//alert('watchprogressBarCurrent::new:'+newValue+', old:'+oldValue);
				if ($stateParams.stepId!=='32') {return;}
				if (oldValue===newValue) {return;}
				if ($scope.progressBarCurrent >= $scope.progressBarTotal) {
					$scope.watchprogressBarCurrent();
					$timeout(function(){
					    if (PumpApp.Utils.isDemo())
						$scope.enableNotificationsSuccess();
					    else {
						$scope.performActionFailure();
						}
					},500);
				}
				else {
					$('.enablePhoneProgressBarFill').animate({
						width: ($scope.progressBarCurrent/$scope.progressBarTotal*100)+'%'
						}, 100, function() {
					});
				}
			}, true);
			

////ProgressBar
				$scope.enableNotificationsSuccess = function() {
//alert('enableNotificationsSuccess');
				    $scope.$apply(function() {
				      $scope.progressBarCurrent = 0;

					var savedId = $rootScope.setupPump.id;
/////////////////////////////////
// Save Ip Address
				//alert('-enableNotificationsSuccess--$scope.ip=='+$scope.ip);
//alert('$rootScope.setupPump.id==='+$rootScope.setupPump.id);
//alert('enableNotificationsSuccess--$scope.ip==='+$scope.ip);
$rootScope.setupPump.wifiipaddress = $scope.ip;
//alert('$rootScope.setupPump.wifiipaddress=='+$rootScope.setupPump.wifiipaddress);

//alert('>>>savePump');
		var found = false;
		for(var j=0; !found && j<$rootScope.pumps.length; j++) {
			if ($rootScope.setupPump.id === $rootScope.pumps[j].id) {
				found = true;
			}
		}
		if (!found) {
			$rootScope.savePump($rootScope.setupPump);
		}

//alert('<<<savePump');
/////////////////////////////////

// Register FCM Token HERE
//alert('Send FCM Token Update');
					var loginData = PumpApp.Request.Builder.Login();
	//alert('loginData:'+loginData);
					$rootScope.makeRequest(loginData).then(
						function success(response){
	//alert('response:'+response.data[1]);
//alert('savedId:'+savedId);
var idStr = $rootScope.normalizePumpIdentity(savedId);
//alert('FINAL idStr:'+idStr);
							var getData = PumpApp.Request.Builder.PutTokenIds(response.data[1],
					idStr, $rootScope.me.name, $rootScope.me.platform,
					//$rootScope.setupPump.id, $rootScope.me.name, $rootScope.me.platform,
					$rootScope.me.fcmtoken, $rootScope.me.deviceuuid);
	//alert('getData:'+getData);
							$rootScope.makeRequest(getData).then(
								function(response) {
//    Object.keys(response).forEach(function(prop) {    
//        alert(prop + " = " + response[prop]);
//    });
//alert('BREAK');
    //Object.keys(response.data).forEach(function(prop) {    
        //alert(prop + " = " + response.data[prop]);
    //});
	//alert('response:'+response.status); // FCM Token
	//alert('response:'+response.data[1][3]); // FCM Token
								},
								function error(e){
	//alert('e:'+e.status);
									debugger;
								}
							);
						},
						function error(e){
	//alert('e:'+e.status);
							debugger;
						}
					);

////////////////////////////////

						$timeout(function(){
//alert('goToSetupPage(34)');
					$scope.goToSetupPage(34);
						}, 1000);

				    });


				};

			$scope.enablePhoneNotificationsWithSocket = function(begin, end) {
//////////////////////////////////////////////////////////////////////////////////////
			////ProgressBar
							$scope.progressBarCurrent = 0;
							$scope.progressBarTotal = end-begin+1;  // 256 later
			////ProgressBar
				DeviceUtility.getCurrentSSID(
				function ssidHandler(s){
					$rootScope.unverifiedSSID = s.replace(/"/g,'');
			//alert('enableNotification::unverifiedSSID: '+$rootScope.unverifiedSSID);
					if ($rootScope.me.wifiname.length > 0 && $rootScope.me.wifiname !== $rootScope.unverifiedSSID) {
	alert('Current SSID ['+$rootScope.unverifiedSSID+'] != HOME SSID ['+$rootScope.me.wifiname+']');
						if (PumpApp.Utils.isAndroid()) {
							$scope.openWifiSettings();
						}
						$scope.performActionFailure();
//						$rootScope.togglePopup('popupVerifyWifi');
					} else {
					    if ($rootScope.me.ipaddress == null || $rootScope.me.ipaddress == undefined || $rootScope.me.ipaddress.length === 0) {
				alert('Cannot continue - NO IP address');
					    } else {
			//////////////////////////////////////////
						var addr = $rootScope.me.ipaddress.split(".", 4);
						var subnet = addr[0] + '.' + addr[1] + '.' + addr[2];
						var fourthDigit = parseInt(addr[3]);
						//alert('subNet:' + subnet + ', last:' + fourthDigit);

						var startDigit = begin-1;
						var lastDigit = end+1;
	if (begin === 0 && end === 255) {
		startDigit = (fourthDigit >= 100) ? 99 : 0;
		lastDigit = startDigit + 256;
		$scope.useProgressBar = true;
	} else {
		$scope.useProgressBar = false;
        }

						//alert('start: ' + startDigit + ', last:' + lastDigit);
			///???????////
						// Limit concurrent pump searching 
						$scope.locked = false;
						$scope.enableSuccess = false;
						$scope.searchTimer = null;
						function searchPump() {
						//alert('searchPump TIMEOUT');
							if ($scope.locked != true) {
					//alert('YEAH, NOT locked');
								startDigit++;
			////ProgressBar
			if ($scope.useProgressBar) {
				    $scope.$apply(function() {
//alert('$scope.incrementProgressBar() is called');
				      $scope.incrementProgressBar();
				    });
			}

								if (startDigit<lastDigit) {
									var modulus = startDigit % 256;
									//alert('in for loop, modulus: ' + modulus);
								    	if ((modulus == fourthDigit) || (modulus == 255) 
										|| (modulus == 254)  || (modulus == 0)) {
								    		//alert('SKIP modulus: ' + modulus);
								    	} else {
										$scope.locked = true;
			/////////////////////////>>>>>>>>>>>>>>>>>>>
				var socket = new Socket();
				var cmd = "";
				var stopPingTimer = function() {
					if ($scope.pingTimer != null) {
					    	clearTimeout($scope.pingTimer);
						$scope.pingTimer = null;
					}
				};  // stopPingTimer

				socket.onData = function(data) {
				  // invoked after new batch of data is received (typed array of bytes Uint8Array)
					stopPingTimer();

					var dataString = new TextDecoder("utf-8").decode(data);
					dataString = dataString.replace('\r\n','');
					//alert("RESPONSE:" + dataString + '('+$scope.ip+')');
					if (dataString.includes(cmd)) {
						var substr = dataString.substring(cmd.length+1).split(":", 2);
						if (substr.length === 2) { // MAC & ID
							if ($rootScope.setupPump.macaddress == null || $rootScope.setupPump.macaddress == undefined || $rootScope.setupPump.macaddress.length === 0) {
								$rootScope.setupPump.macaddress = substr[0];
								$rootScope.setupPump.id =$rootScope.convertPumpIdentity(substr[1]);
								//$rootScope.setupPump.id = $rootScope.normalizePumpIdentity(substr[1]);

alert('enablePhoneNotifications:::macaddress [' + $rootScope.setupPump.macaddress + '] id [' + $rootScope.setupPump.id+']');
								$scope.enableSuccess = true;
//alert('$scope.enableSuccess='+$scope.enableSuccess);
							} else if (dataString.includes($rootScope.setupPump.macaddress)) {
								$rootScope.setupPump.id =$rootScope.convertPumpIdentity(substr[1]);
								//$rootScope.setupPump.id = $rootScope.normalizePumpIdentity(substr[1]);
alert('enablePhoneNotifications:::macaddress [' + $rootScope.setupPump.macaddress + '] id [' + $rootScope.setupPump.id+']');

								$scope.enableSuccess=true;
//alert('$scope.enableSuccess='+$scope.enableSuccess);
							}


alert('operation mode lock');
							socket.write(PumpApp.Utils.formatUint8Array
								("operation mode lock\r\n"));
				
						startDigit = lastDigit; // FORCE OUT
				//alert('clearInterval($scope.searchTimer)');

							if ($scope.searchTimer != null) clearInterval($scope.searchTimer);
							$scope.searchTimer = null;

						}
					}

					setTimeout(function(){
						alert('Enabled...closing socket');
						socket.close();

					},200);

				};// socket.onData

				socket.onError = function(errorMessage) {
				  // invoked after error occurs during connection
					stopPingTimer();
					alert('Connection Error: ' + errorMessage + '('+$scope.ip+')');
					//$scope.performActionFailure();
					//!!!!!!
				    	$scope.locked = false;


				};// socket.onError

				socket.onClose = function(hasError) {
				  // invoked after connection close
					stopPingTimer();
					alert('Connection Closed: ' + hasError + '('+$scope.ip+')');
					//!!!!!!
				    	$scope.locked = false;
//alert('$scope.enableSuccess='+$scope.enableSuccess);
					if ($scope.enableSuccess === true) {
//alert('>>>>>>>>>>>enableNotificationsSuccess');
						$scope.enableNotificationsSuccess();
					}

				}; // socket.onClose


				$scope.ip = subnet+'.'+modulus.toString();
				//alert('$scope.ip=='+$scope.ip);
				/// Set Ping TIMEOUT to 3000
				$scope.pingTimer = setTimeout(function(){
alert('pingTimer TIMEOUT' + '('+$scope.ip+')');
				    	$scope.locked = false;
					$scope.pingTimer = null;
				}, 3000);

				alert('socket.open(' + subnet+'.'+modulus.toString() + ':' +PumpApp.Constants.PumpApPortNo+ ')');
				socket.open(subnet+'.'+modulus.toString(), PumpApp.Constants.PumpApPortNo,
				  function() {
				    // invoked after successful opening of socket
					alert('Opening socket: Successful');
					// Try to CONNECT to Pump
					cmd = "Connect";
					var tmp3 = "connect " + $rootScope.me.deviceuuid + "\r\n";
					alert(tmp3);
					socket.write(PumpApp.Utils.formatUint8Array
						("connect " + $rootScope.me.deviceuuid + "\r\n"));
				  },
				  function(errorMessage) {
				    // invoked after unsuccessful opening of socket
					stopPingTimer();
					alert('Opening socket: Faield: ' + errorMessage + '('+$scope.ip+')');
				    	$scope.locked = false;
				  }
				);  // socket.open
			/////////////////////////>>>>>>>>>>>>>>>>>>>
									} // modulus check
								} else { // > lastDigit
									if ($scope.searchTimer != null) clearInterval($scope.searchTimer);
									$scope.searchTimer = null;
									//alert('FINALLY OUT $scope.enableSuccess=='+$scope.enableSuccess);
				if ($scope.enableSuccess === true) {
alert('Out of Loop<<<<<<<<<$scope.enableNotificationsSuccess()');
					$scope.enableNotificationsSuccess();
				} else {
alert('Out of Loop<<<<<<<<<$scope.performActionFailure()');
					$scope.performActionFailure();
}
								}

							} 
						}
						searchPump();
						$scope.searchTimer = setInterval(searchPump, 2000);
			///????///////






			//////////////////////////////////////////
					    }  // else
					}  // else
				}, //ssidHandler
				function fail(){
					$rootScope.togglePopup('popupVerifyWifiFail');
				});  // getCurrentSSID
			}
///////////////////////////////////////////////////////////////////////////////////////


			$scope.enablePhoneNotifications = function() {
				// Attempt to enable phone notifications for this phone for the pump
				if (PumpApp.Utils.isDemo()) {
					$scope.demoProgressbarInt = $interval(function(){
						if ($scope.progressBarCurrent >= $scope.progressBarTotal) {
							$interval.cancel($scope.demoProgressbarInt);
						}
						else {
							$scope.incrementProgressBar();
						}
					},100);
				}
				else {
				    if (PumpApp.Utils.isDemo20180322()) {
////?????///////?????
///		Query server Pump IP address
//alert('$rootScope.setupPump.macaddress::'+$rootScope.setupPump.macaddress);


				    if ($rootScope.setupPump.macaddress == null || $rootScope.setupPump.macaddress == undefined || $rootScope.setupPump.macaddress.length === 0) {
//alert('HERE');
alert('enablePhoneNotifications::: NO MAC ::: search thru whole subnet!!!');
					$scope.enablePhoneNotificationsWithSocket(0, 255);
				    } else {
alert('enablePhoneNotifications::: Query server Pump IP address with MAC ['+$rootScope.setupPump.macaddress+']');

					var loginData = PumpApp.Request.Builder.Login();
//alert('loginData:'+loginData);
					$rootScope.makeRequest(loginData).then(
						function success(response){
	//alert('response:'+response.data[1]);
							var getData = PumpApp.Request.Builder.SearchPumpIp(
							  response.data[1], "0x"+$rootScope.setupPump.macaddress+"0000");
//alert('getData:'+getData);
							$rootScope.makeRequest(getData).then(
								function(response) {
	//alert('response:'+response.data[1].length); // IP Address
								if (response.data[1].length == 1) {
									var ipStr = response.data[1][0][0];
									//alert('ipStr:'+ipStr);				
									if (ipStr === '0xffffffff') {
										//alert('SAME 0xffffffff:');
alert('enablePhoneNotifications::: NO Pump IP Found ::: search thru whole subnet!!!');
								$scope.enablePhoneNotificationsWithSocket(0, 255);
									} else {
										//alert('NOT 0xffffffff');
alert('enablePhoneNotifications::: Pump IP Found ['+ipStr+']');
										var last = parseInt(ipStr.substring(8, 10), 16);
										//alert('last:'+last);
								$scope.enablePhoneNotificationsWithSocket(last, last);
									}
								} else {
alert('enablePhoneNotifications::: NO Pump IP RESPONSE ::: search thru whole subnet!!!');
									$scope.enablePhoneNotificationsWithSocket(0, 255);
								}
								},
								function error(e){
	//alert('e:'+e.status);
							$scope.enablePhoneNotificationsWithSocket(0, 255);
									//debugger;
								}
							);
						},
						function error(e){
	//alert('e:'+e.status);
							$scope.enablePhoneNotificationsWithSocket(0, 255);
							//debugger;
						}
					);


				    }

////?????///////?????

				    } else { // !isDemo20180322
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
//alert('performActionFailure');
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
