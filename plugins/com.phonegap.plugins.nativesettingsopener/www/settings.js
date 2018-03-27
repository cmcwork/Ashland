var exec = require("cordova/exec");

function NativeSettings() {
}

NativeSettings.prototype.open = function(onsucess, onfail) {
	exec(onsucess, onfail, "NativeSettings", "open", []);
};

NativeSettings.prototype.openGlobal = function(onsucess, onfail) {
	exec(onsucess, onfail, "NativeSettings", "openGlobal", []);
};


var NativeSettings = new NativeSettings();
module.exports = NativeSettings;
