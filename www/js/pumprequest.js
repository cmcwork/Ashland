(function(){
	"use strict";
	
	window.PumpApp = window.PumpApp || {};
	window.PumpApp.Request = window.PumpApp.Request || {};
	
	var requestBuilder = {
		Login: function() {
			return [["LOGIN", "0x0001", "admin", "password"]];
		},
		GetAllPumps: function(data) {
			return [["GET", data], ["//0x02/0x01", "@ALL_NODE", "@INDEX,1,2,3,5,6,19,22,24,7"]];
		},
		GetPumpById: function(data, pumpId) {
			return [["GET", data], ["//0x02/0x01", pumpId, "@INDEX,1,2,3,5,6,19,22,24,7"]];
		},
		ExecuteCommand: function(data, pumpId, command) {
			return [["NODE_STRCMD", data], ["//0x02/0x01", pumpId, command]];
		},
		AppNodeSearch: function() {
			return [["APP_NODESEARCH","","0123456789012345"]];
		},
		NodePropertyGet: function(data, pumpId, propertyName) {
			return [["NODE_PROPERTY_GET",data],["//0x02/0x01",pumpId,propertyName]];
		},
		NodePropertySet: function(data, pumpId, propertyName, propertyValue) {
			return [["NODE_PROPERTY_SET", data],["//0x02/0x01",pumpId,propertyName,propertyValue]];
		},
		PutTokenIds: function(data, pumpId, phoneName, platform, fcmToken, deviceId) {
			return [["PUT_TOKENIDS", data],["//0x02/0x01", pumpId, [[phoneName, "FCM", platform, fcmToken, deviceId]]]];
		},
		SearchPumpIp: function(data, mac) {
			return [["SEARCH", data],["//0x02/0x01", [["0x2", "=", mac]], "9", "1,20"]];
		}
	};
	window.PumpApp.Request.Builder = requestBuilder;
})();
