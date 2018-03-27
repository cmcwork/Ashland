/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
(function(){
	"use strict";
	
	angular.module('pumpApp', ['ui.router', 'ngTouch', 'LocalForageModule', 'ui.bootstrap'])
	.directive('menuRepeatDirective', function() {
		return function(scope, element, attrs) {
			var itemHeight = $('.app').height() * 0.06;
			angular.element(element).css('height', itemHeight + 'px');
		};
	})
	.directive('onFinishRender', function ($timeout) {
		return {
			restrict: 'A',
			link: function (scope, element, attr) {
				if (scope.$last === true) {
					$timeout(function () {
						scope.$emit(attr.onFinishRender);
					});
				}
			}
		}
	})
	.run(['$rootScope', '$state', '$window', '$stateParams', '$timeout', '$http', '$localForage',
		function($rootScope, $state, $window, $stateParams, $timeout, $http, $localForage) {	
			$rootScope.footerVisible = true;
			$rootScope.isRootBack = true;		
			$rootScope.backPage = '';
			
			$rootScope.hasInitialized = false;
			
			$rootScope.unverifiedSSID = '';
			$rootScope.checkWifiConnection = function() {
				if (PumpApp.Utils.isPhone()) {
					DeviceUtility.getCurrentSSID(
						function ssidHandler(s){
							$rootScope.unverifiedSSID = s.replace(/"/g,'');
							if ($rootScope.me.wifiname == null || $rootScope.me.wifiname == undefined 
								|| $rootScope.me.wifiname.length === 0
								|| ($rootScope.me.wifiname.length > 0 && $rootScope.me.wifiname !== $rootScope.unverifiedSSID)) {
								$rootScope.togglePopup('popupVerifyWifi');
							}
						}, 
						function fail(){
							$rootScope.togglePopup('popupVerifyWifiFail');
						});
				}
				else if(PumpApp.Utils.isDemo()) {
					$rootScope.unverifiedSSID = 'My Home Wifi';
					if ($rootScope.me.wifiname == null || $rootScope.me.wifiname == undefined || $rootScope.me.wifiname.length === 0 || ($rootScope.me.wifiname.length > 0 && $rootScope.me.wifiname !== $rootScope.unverifiedSSID)) {
						$rootScope.togglePopup('popupVerifyWifi');
					}
				}
			};
			
			$rootScope.onStart = function() {
				//alert(">>on_start");
				if (PumpApp.Utils.isPhone()) {
					$rootScope.push = PushNotification.init({
						"android": {
						"icon": "alert",
						"iconColor": "red"
						},
						"browser": {
						pushServiceURL: 'http://push.api.phonegap.com/v1/push'
						},
						"ios": {
							"alert": "true",
							"badge": "true",
							"sound": "true"
						},
						"windows": {}
					});

					$rootScope.push.on('registration', (data) => {
						//alert('FCM registration: ' + data.registrationId);
						$rootScope.me.fcmtoken = data.registrationId;
						// send data.registrationId to push service
					}); // end of push.on.registration


					$rootScope.push.on('notification', (data) => {
						// do something with the push data
						alert('FCM notification: ' + data.message);
						//var str = "FCM Push Message:\n    notId: " + data.additionalData.notId
						//	+ ";\n    sender platform: " + data.additionalData.platform
						//	+ ";\n    sender model: " + data.additionalData.model
						//	+ ";\n    sender fcmToken: " + data.additionalData.fcmToken
						//	+ ";\n    message: " + data.message;
						//alert(str);
						
						//$rootScope.saveMessage('0x0000', new PumpApp.Message({message:'hello world 5',pumpIdentity:'0x0000'}));
						$rootScope.saveMessage(data.additionalData.pumpIdentity, new PumpApp.Message({message:data.message,pumpIdentity:data.additionalData.pumpIdentity}));
						
						// then call finish to let the OS know we are done
						push.finish(() => {
							//console.log("processing of push data is finished");
						}, () => {
						//console.log("something went wrong with push.finish for ID =", data.additionalData.notId);
						}, data.additionalData.notId);
					});  // end of push.on.notification
				}
				
				$rootScope.checkWifiConnection();
				
				if (angular.isDefined($rootScope.pumps.length)) {
					if (!$rootScope.isMeComplete()) {
						$rootScope.navigateToPage('me');
					}
					else if ($rootScope.pumps.length > 0) {
						$rootScope.navigateToPage('pumps');
					}
					else {
						$rootScope.navigateToPage('setup', {stepId:0});
					}
				}
				else {
					$rootScope.navigateToPage('me');
				}
				
				$rootScope.hasInitialized = true;
				if (navigator.splashscreen)
				{
					navigator.splashscreen.hide();
				}
			};
			
			//Local database hydration
			//$localForage.clear();return; //clear all database data
			
			//Me information - all changes to $rootScope.me are persisted to database 
			$rootScope.me = new PumpApp.Me();
			$localForage.bind($rootScope, { key: 'me', defaultValue: {} }).then(function(data) {
				if (!angular.isDefined($rootScope.me.name) || !angular.isDefined(data.name)) {
					$rootScope.me = new PumpApp.Me();
					
					if (PumpApp.Utils.isPhone()) {
						$rootScope.me.deviceuuid = device.uuid;
						$rootScope.me.platform = device.platform;
						$rootScope.me.model = device.model;
					}
				}
			});
			
			//Messages - all changes to $rootScope.messages are persisted to database 
			$rootScope.messages = {};
			$rootScope.currentMessages = null;
			$rootScope.messagesStoreByPumpProperty = 'id'; //group messages by something unique PumpApp.Pump (in models.js) Example: 'id' or 'serialno'
			$localForage.bind($rootScope, { key: 'messages', defaultValue: {} }).then(function(data) {
				$rootScope.messages = data; //Do not delete this line
				
				//Insert some test data messages for the first pump
				if (PumpApp.Utils.isDemo()) {
					if ($rootScope.messages['0x0000'] === null || $rootScope.messages['0x0000'] === undefined) {
						$rootScope.saveMessage('0x0000', new PumpApp.Message({message:'hello world1',senderIsPump:false,pumpIdentity:'0x0000'}));
						$rootScope.saveMessage('0x0000', new PumpApp.Message({message:'hello world2',pumpIdentity:'0x0000'}));
						$rootScope.saveMessage('0x0000', new PumpApp.Message({message:'hello world3',senderIsPump:false,pumpIdentity:'0x0000'}));
						$rootScope.saveMessage('0x0000', new PumpApp.Message({message:'hello world4',pumpIdentity:'0x0000'}));
						$rootScope.saveMessage('0x0001', new PumpApp.Message({message:'hello world5',isAlert:true,pumpIdentity:'0x0001'}));
						setTimeout(function(){
							$rootScope.saveMessage('0x0002', new PumpApp.Message({message:'hello world6',pumpIdentity:'0x0002'}));
							$rootScope.saveMessage('0x0002', new PumpApp.Message({message:'hello world7',pumpIdentity:'0x0002'}));
							$rootScope.saveMessage('0x0002', new PumpApp.Message({message:'hello world8',pumpIdentity:'0x0002'}));
							$rootScope.saveMessage('0x0002', new PumpApp.Message({message:'hello world9',pumpIdentity:'0x0002'}));
							$rootScope.saveMessage('0x0002', new PumpApp.Message({message:'hello world10',pumpIdentity:'0x0002'}));
							$rootScope.saveMessage('0x0002', new PumpApp.Message({message:'hello world11',pumpIdentity:'0x0002'}));
							$rootScope.saveMessage('0x0002', new PumpApp.Message({message:'hello world12',pumpIdentity:'0x0002'}));
							$rootScope.saveMessage('0x0002', new PumpApp.Message({message:'hello world13',pumpIdentity:'0x0002'}));
							$rootScope.saveMessage('0x0002', new PumpApp.Message({message:'hello world14',pumpIdentity:'0x0002'}));
						},10000);
					}
				}
			});
			
			$rootScope.setupPump = undefined;
			$localForage.bind($rootScope, { key: 'setupPump', defaultValue: {} }).then(function(data) {
				if (angular.isDefined(data.name)) {
					$rootScope.setupPump = data; //Do not delete this line
				}
				else {
					$rootScope.setupPump = PumpApp.PumpUtil.create();
				}
			});
			
			//Pumps list - all changes to $rootScope.pumps are persisted to database 
			$rootScope.pumps = [];
			$rootScope.selectedPump = null;
			$localForage.bind($rootScope, { key: 'pumps', defaultValue: {} }).then(function(data) {
				$rootScope.pumps = data; //Do not delete this line
			});
			
			$rootScope.savePump = function(pump) {
				if (!PumpApp.Utils.isDemo()) {
					if (!angular.isDefined($rootScope.pumps.push)) {
						$rootScope.pumps = [];
					}
					$rootScope.pumps.push($rootScope.setupPump);
				}
				else {
					//TODO: save to $http here
				}
				
				$rootScope.setupPump = PumpApp.PumpUtil.create(); //Do not delete this, for saving pump setup progress
			};
			
			$rootScope.updateCurrentMessages = function() {
				if ($rootScope.selectedPump === null || $rootScope.selectedPump === undefined) {
					try {
						$rootScope.currentMessages = [].concat.apply([], Object.values($rootScope.messages));
						if ($rootScope.currentMessages === null || $rootScope.currentMessages === undefined) {
							$rootScope.currentMessages = [];
						}
					}
					catch(error) {
						$rootScope.currentMessages = [];
					}
				}
				else {
					if (angular.isDefined($rootScope.messages[$rootScope.selectedPump[$rootScope.messagesStoreByPumpProperty]])) {
						$rootScope.currentMessages = [].concat($rootScope.messages[$rootScope.selectedPump[$rootScope.messagesStoreByPumpProperty]]);
					}
					else {
						$rootScope.currentMessages = [];
					}
				}
			};
			
			$rootScope.unreadMessageCount = function(pumpGrouping) {
				if ($rootScope.messages[pumpGrouping] === null || $rootScope.messages[pumpGrouping] === undefined) {
					return [0,0];
				}
				
				var unread = 0;
				var alerts = 0;
				for (var i = 0; i < $rootScope.messages[pumpGrouping].length; i++) {
					if ($rootScope.messages[pumpGrouping][i].unread) {
						unread++;
						if ($rootScope.messages[pumpGrouping][i].isAlert) {
							alerts++;
						}
					}
				}
				
				return [unread,alerts];
			}
			
			$rootScope.markAllAsRead = function(pumpGrouping) {
				if ($rootScope.messages[pumpGrouping] === null || $rootScope.messages[pumpGrouping] === undefined) {
					return;
				}
				
				for (var i = 0; i < $rootScope.messages[pumpGrouping].length; i++) {
					if ($rootScope.messages[pumpGrouping][i].unread) {
						$rootScope.messages[pumpGrouping][i].unread = false;
					}
				}
			}
			
			$rootScope.saveMessage = function(pumpGrouping, message, updateDirect) {
				if (updateDirect === true) {
					if ($rootScope.messages[pumpGrouping] === null || $rootScope.messages[pumpGrouping] === undefined) {
						$rootScope.messages[pumpGrouping] = [];
					}
					
					$rootScope.messages[pumpGrouping].push(message);
				}
				else {
					try {
						$rootScope.$apply(function () {
							$rootScope.saveMessage(pumpGrouping, message, true);
						});
					}
					catch (error) {
						$rootScope.saveMessage(pumpGrouping, message, true);
					}
				}
			};
			
			$rootScope.sendMessage = function(pump, command, message) {
				//Do send command to pump... here
				var loginData = PumpApp.Request.Builder.Login();
				var pumpIdentity = pump[$rootScope.messagesStoreByPumpProperty];
				
				$rootScope.makeRequest(loginData).then(
					function success(response){
						var getData = PumpApp.Request.Builder.ExecuteCommand(response.data[1], pump.id, command);
						$rootScope.makeRequest(getData).then(
							function(response) {
								if (response.data[0] === 'error') {
									$rootScope.saveMessage(pumpIdentity, new PumpApp.Message({message:'Command execution error response as follows: '+response.data[1],pumpIdentity:pumpIdentity,isAlert:true}));
								}
								else {
									$rootScope.saveMessage(pumpIdentity, new PumpApp.Message({message:response.data[1],pumpIdentity:pumpIdentity}));
								}
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

				$rootScope.saveMessage(pumpIdentity, new PumpApp.Message({message:message,senderIsPump:false,pumpIdentity:pumpIdentity}));
			};
			
			$rootScope.navigateToPage = function(page, params, options) {
				if (!angular.isDefined(params)) {
					params = {};
				}
				if (!angular.isDefined(options)) {
					options = {location:'replace'};
				}
				$state.go(page, params, options);
			};
			
			$rootScope.pageNames = {
				'pumps':'Pumps',
				'setup':'Setup',
				'me':'Me',
				'edit':'Edit',
				'scan':'Scan',
				'pumpdetails':'Pump Details',
				'messages':'Messages'
			};
			
			$rootScope.selectFooter = function(page) {
				if ($rootScope.page === page) {
					return;
				}
				
				if (!$rootScope.isMeComplete()) {
					$rootScope.togglePopup('popupMeIncomplete');
					return;
				}
				
				$rootScope.page = page;
				
				if (page === 'setup') {
					$rootScope.navigateToPage(page, {stepId:0});
				}
				else {
					$rootScope.footerVisible = true;
					$rootScope.navigateToPage(page);
				}
			};
			
			$rootScope.isMeComplete = function() {
				if (!angular.isDefined($rootScope.me)) {
					return false;
				}
				if ($rootScope.me.name === '') {
					return false;
				}
				if ($rootScope.me.email === '') {
					return false;
				}
				if ($rootScope.me.zipcode === '') {
					return false;
				}
				if ($rootScope.me.allowlocation === null) {
					return false;
				}
				if ($rootScope.me.wifiname === '') {
					return false;
				}
				if ($rootScope.me.wifipassexists === null || ($rootScope.me.wifipass === '' && $rootScope.me.wifipassexists === false)) {
					return false;
				}
				
				return true;
			};
			
			$rootScope.popupShowing = false;
			$rootScope.currentPopup = '';
			$rootScope.popupStates = [];
			$rootScope.popupStates['popupMeIncomplete'] = {
				buttons:[
					{
						title:'Continue',
						styleClass:'popupButtonConfirm',
						callback:function(){$rootScope.togglePopup();}
					}
				]
			};
			$rootScope.popupStates['popupVerifyWifi'] = {
				buttons:[
					{
						title:'Yes',
						styleClass:'popupButtonConfirm popupButtonConfirmWifi',
						callback:function(){
							$rootScope.me.wifiname = $rootScope.unverifiedSSID;
							$rootScope.togglePopup();
							$rootScope.me.wifipass = '';
							$rootScope.me.wifipassexists = null;
							$rootScope.navigateToPage('me');
							}
					},
					{
						title:'No',
						styleClass:'popupButtonConfirm popupButtonConfirmWifi popupButtonConfirmWifiNo',
						callback:function(){$rootScope.togglePopup();$rootScope.togglePopup('popupVerifyWifiNo');}
					}
				]
			};
			$rootScope.popupStates['popupVerifyWifiNo'] = {
				buttons:[
					{
						title:'Exit',
						styleClass:'popupButtonConfirm',
						callback:function(){
							if (PumpApp.Utils.isAndroid()) {
								if(navigator.app) {
									navigator.app.exitApp();
								}
							}
						}
					}
				]
			};
			$rootScope.popupStates['popupVerifyWifiFail'] = {
				buttons:[
					{
						title:'Exit',
						styleClass:'popupButtonConfirm',
						callback:function(){
							if (PumpApp.Utils.isAndroid()) {
								if(navigator.app) {
									navigator.app.exitApp();
								}
							}
						}
					}
				]
			};
			$rootScope.popupStates['popupConfirmExit'] = {
				buttons:[
					{
						title:'Yes',
						styleClass:'popupButtonConfirm popupButtonConfirmWifi',
						callback:function(){
								if (PumpApp.Utils.isAndroid()) {
									navigator.app.exitApp();
								}
								else {
									$rootScope.togglePopup();
								}
							}
					},
					{
						title:'No',
						styleClass:'popupButtonConfirm popupButtonConfirmWifi popupButtonConfirmWifiNo',
						callback:function(){$rootScope.togglePopup();}
					}
				]
			};
			
			$rootScope.togglePopup = function(name) {
				$rootScope.popupShowing = !$rootScope.popupShowing;
				$rootScope.currentPopup = name;
			};
			
			$rootScope.menuShowing = false;
			$rootScope.menuOptions = [];
			$rootScope.createMenu = function(options) {
				$rootScope.menuShowing = false;
				$('.menu').css('top', (6*options.length*-1) + '%');
				$rootScope.menuOptions = options;
			};
			$rootScope.toggleMenu = function(force) {
				if (angular.isDefined(force)) {
					$rootScope.menuShowing = force;
				}
				else {
					$rootScope.menuShowing = !$rootScope.menuShowing;
				}
				
				var menuTop = 10;
				if (!$rootScope.menuShowing) {
					menuTop = (6*$rootScope.menuOptions.length*-1);
				}
				
				//$('.menu').css('top', menuTop + '%');
				$('.menu').animate({
					top: menuTop + '%'
					}, 315, function() {
					// Animation complete.
				});
			};
			$(document).click(function() {
				if($rootScope.menuShowing) {
					$rootScope.toggleMenu(false);
				}
			});
			$(".menu").click(function(e) {
				e.stopPropagation();
				return false;
			});
			$(".headerRight").click(function(e) {
				e.stopPropagation();
				return false;
			});

			$rootScope.showScanning = false;
			$rootScope.scan = function(args) {
				$rootScope.toggleMenu();
				$rootScope.backPage = args.page;
				
				if (angular.isDefined(args.callback)) {
					args.callback();
				}
				
				if (PumpApp.Utils.isPhone()) {
					cordova.plugins.barcodeScanner.scan(
						function (result) {
							args.success(result);
						},
						function (error) {
							args.error(error);
						}
					);
				}
			};
			
			$rootScope.clearScanState = function() {
				$rootScope.showScanning = false;
				$rootScope.isRootBack = true;
				$rootScope.rootBackFunc = $rootScope.masterRootBack;
				$rootScope.footerVisible = true;
				$rootScope.page = $rootScope.backPage;
				$rootScope.backPage = '';
			};
			
			$rootScope.iconFillColors = [
				'#75C043',
				'#66A83B',
				'#589032',
				'#49782A',
				'#3A6022',
				'#2C4819',
				'#1D3011',
				'#0F1808'
			];
			$rootScope.iconFillColor = function(index) {
				return $rootScope.iconFillColors[index%$rootScope.iconFillColors.length];
			};
			
			$rootScope.getPumpByIdentity = function(pumpIdentity) {
				for (var i = 0; i < $rootScope.pumps.length; i++) {
					if ($rootScope.pumps[i][$rootScope.messagesStoreByPumpProperty] === pumpIdentity) {
						return $rootScope.pumps[i];
					}
				}
			};
			
			$rootScope.getPumpError = function(error) {
				if (!angular.isDefined(PumpApp.ErrorCodes[error])
					&& error !== '') {
						return 'Unknown';
				}
				return PumpApp.ErrorCodes[error];
			};
			
			$rootScope.makeRequest = function(data) {
				return $http({
					url: "http://207.135.172.62:8090/AVAT_DB/ACTION",
					method: "POST",
					data: data
				})
			};
    }]);

	// configure our routes
	angular.module('pumpApp').config(['$urlRouterProvider', '$stateProvider', '$localForageProvider', function ($urlRouterProvider, $stateProvider, $localForageProvider) {
		 $localForageProvider.config({
			name        : 'pumpApp', // name of the database and prefix for your data, it is "lf" by default
			version     : 1.0, // version of the database, you shouldn't have to use this
			storeName   : 'keyvaluepairs', // name of the table
			description : 'Pump app persisted storage'
		});
			
		$urlRouterProvider.otherwise(function() {
            return '/landing'
        }),
        $stateProvider.state({
            name: 'pumps',
            url: '/pumps',
            templateUrl: 'pages/pumps.html',
            controller: 'pumpsController as vm'
        }),   
        $stateProvider.state({
            name: 'pumpdetails',
            url: '/pumpdetails/:pumpId',
            templateUrl: 'pages/pumpdetails.html',
            controller: 'pumpDetailsController as vm'
        }),   
        $stateProvider.state({
            name: 'messages',
            url: '/messages',
            templateUrl: 'pages/messages.html',
            controller: 'messagesController as vm'
        }),  
        $stateProvider.state({
            name: 'setup',
            url: '/setup/:stepId',
            templateUrl: function($stateParams){                        
                return 'pages/setup/' + $stateParams.stepId +'.html';
            },
            controller: 'setupController as vm'
        });
        $stateProvider.state({
            name: 'me',
            url: '/me',
            templateUrl: 'pages/me.html',
            controller: 'meController as vm'
        });
        $stateProvider.state({
            name: 'landing',
            url: '/landing',
            templateUrl: 'pages/landing.html',
            controller: 'landingController as vm'
        });
	}]);
	
	angular.module('pumpApp').controller('indexController', ['$scope', '$state', '$stateParams', '$rootScope', '$timeout', '$interval',
		function($scope, $state, $stateParams, $rootScope, $timeout, $interval) {
			$rootScope.masterRootBack = function() {
				if (!PumpApp.Utils.isIPhone()) {
					$rootScope.togglePopup('popupConfirmExit');
				}
			};
			
			$rootScope.rootBackFunc = $rootScope.masterRootBack;
			
			$scope.rootBackFuncWarpper = function() {
				try {
					$scope.$apply(function(){$rootScope.rootBackFunc();});
				}
				catch(error) {
					$rootScope.rootBackFunc();
				}
			};
			
			if (PumpApp.Utils.isAndroid()) {
				document.addEventListener('backbutton', function (e) {
					$scope.rootBackFuncWarpper();
				}, false);
			}
	}]);

	// View: pumps
	// see js/pages/pumps.js
	
	// View: pumpsDetails
	// see js/pages/pumpsDetails.js
	

	// View: setup
	// see js/pages/setup.js

	// View: me
	// see js/pages/me.js
})();


