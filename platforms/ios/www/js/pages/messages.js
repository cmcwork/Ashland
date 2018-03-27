(function(){
	"use strict";
	
	
	angular.module('pumpApp').controller('messagesController', ['$scope', '$state', '$stateParams', '$rootScope', '$timeout',
		function($scope, $state, $stateParams, $rootScope, $timeout) {
			$scope.parentPage = $rootScope.page;
			$rootScope.page = 'messages';
			$rootScope.footerVisible = false;
			$rootScope.isRootBack = false;
			
			$scope.hasScrolled = false;
			$scope.showingShortcuts = false;
			$rootScope.currentMessages = null;
			$scope.messageInputText = '';
			
			$scope.shortCutCommands = [
				[
					{
						title:'Status',
						icon:'leafIconSvg',
						message:'Check pump status',
						command:'status'
					},
					{
						title:'Batt',
						icon:'leafIconSvg',
						message:'Check battery',
						command:'pump batt'
					}
				],
				[
					{
						title:'Pump Test',
						icon:'leafIconSvg',
						message:'Pump test',
						command:'pump status'
					},
					{
						title:'Ph List',
						icon:'leafIconSvg',
						message:'Get phone list',
						command:'pump batt'
					}
				],
				[
					{
						title:'Water',
						icon:'leafIconSvg',
						message:'Check water level',
						command:'pump status'
					},
					{
						title:'Settings',
						icon:'leafIconSvg',
						message:'Get pump settings',
						command:'pump batt'
					}
				],
				[
					{
						title:'Temp',
						icon:'leafIconSvg',
						message:'Check room temperature',
						command:'pump status'
					},
					{
						title:'More',
						icon:'leafIconSvg',
						message:'More?',
						command:'pump batt'
					}
				]
			];
			
			$scope.watchMessages = $rootScope.$watch('messages', function (newValue, oldValue, scope) {
				$rootScope.updateCurrentMessages();
				$rootScope.markAllAsRead($scope.pumpDetails[$rootScope.messagesStoreByPumpProperty]);
			}, true);
			
			$scope.messageItemHeight = null;
			$scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
				if ($scope.messageItemHeight === null) {
					$scope.messageItemHeight = $('.messagesMainContainter').height()*0.12;
				}
				
				$(".messagesListContainer").scrollTop($('.messagesListContainer')[0].scrollHeight);
			});
			
			$scope.messageDateToLocale = function(utcDtStr) {
				return PumpApp.Utils.utcStringAsLocalTimeString(utcDtStr);
			}
		
			$scope.toggleShowShortcuts = function(forceValue) {
				if (angular.isDefined(forceValue)) {
					$scope.showingShortcuts = forceValue;
				}
				else {
					$scope.showingShortcuts = !$scope.showingShortcuts;
				}
				
				var newHeight = ($scope.showingShortcuts?48:10);
				var newBarHeight = ($scope.showingShortcuts?$('.messagesInputTop').height():100);
				var newBottomHeight = (($('.messagesMainContainter').height()*(newHeight/100))-newBarHeight);
				newBarHeight += ($scope.showingShortcuts?'px':'%');
				
				$('.messagesInputTop').css('height',newBarHeight);
				$('.messagesShortcuts').css('height',newBottomHeight+'px');
				$('.messagesInputContainer').css('height',newHeight+'%');
				$('.messagesListContainer').css('height',(100-newHeight)+'%');
				
				if (!$scope.hasScrolled) {
					$(".messagesListContainer").scrollTop($('.messagesListContainer')[0].scrollHeight);
				}
			}
			
			$scope.handleScroll = function() {
				if (!$scope.hasScrolled) {
					$scope.hasScrolled = true;
				}
			};
			$(".messagesListContainer").on( "scroll", $scope.handleScroll );
			
			$scope.sendInputAsCommand = function() {
				$scope.toggleShowShortcuts(false);
				
				var command = $scope.messageInputText;
				var message = 'Executing command: ' + command;
				
				$rootScope.sendMessage($rootScope.selectedPump, command, message);
				
				$scope.messageInputText = '';
			};
			
			$scope.shortcutClick = function(shortcut) {
				$scope.toggleShowShortcuts(false);
				
				$scope.sendMessageToPump($rootScope.selectedPump, shortcut.command, shortcut.message);
			};
			
			$scope.sendMessageToPump = function(pump, command, message) {
				if (pump === null || pump === undefined) {
					//Send command to all pumps
					for (var i = 0; i < $rootScope.pumps.length; i++) {
						$rootScope.sendMessage($rootScope.pumps[i], command, message);
					}
				} 
				else {
					$rootScope.sendMessage(pump, command, message);
				}
			};
			
			$scope.messagesBack = function() {
				$rootScope.rootBackFunc = $rootScope.masterRootBack;
				$rootScope.navigateToPage($scope.parentPage);
			};
			$rootScope.rootBackFunc = $scope.messagesBack;
			
			$scope.keyboardshow = function(e)
			{
				$rootScope.$apply(function () {
					$scope.toggleShowShortcuts(false);
				});
				$('.messagesInputContainer').css('bottom', e.keyboardHeight + 'px');
				StatusBar.hide();
			};
			$scope.keyboardhide = function(e) {
				$('.messagesInputContainer').css('bottom', '0');
				StatusBar.hide();
			};
			if (PumpApp.Utils.isPhone()) {
				window.addEventListener('native.keyboardshow', $scope.keyboardshow);
				window.addEventListener('native.keyboardhide', $scope.keyboardhide);
			}
			
			$scope.$on("$destroy",
				function() {
					$rootScope.selectedPump = null;
					$rootScope.currentMessages = null;
					if ($scope.watchMessages !== null && $scope.watchMessages !== undefined) {
						$scope.watchMessages();
					}
					
					if (PumpApp.Utils.isPhone()) {
						window.removeEventListener('native.keyboardshow', $scope.keyboardshow);
						window.removeEventListener('native.keyboardhide', $scope.keyboardhide);
					}
				}
			);
			
			$rootScope.createMenu([]);
			
			$scope.pumpDetails = $rootScope.selectedPump;
			if ($scope.pumpDetails === null || $scope.pumpDetails === undefined) {
				$scope.pumpDetails = {
					id:'',
					idAsNumber:0,
					name:'All Pumps',
					description:''
				};
			}
			
			$rootScope.markAllAsRead($scope.pumpDetails[$rootScope.messagesStoreByPumpProperty]);
	}]);
})();