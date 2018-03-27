var DeviceUtility = {

    /**
     *  grantPermission.
     * @param 	win	callback function
     * @param 	fail	callback function if error
     */
    grantPermission: function(win, fail) {
        cordova.exec(win, fail, 'DeviceUtility', 'grantPermission', []);
    },
    getLocationPermissionStatus: function(win, fail) {
        cordova.exec(win, fail, 'DeviceUtility', 'getLocationPermissionStatus', []);
    },


    /**
     * 	This method formats wifi information into an object for use with the
     * 	addNetwork function. Currently only supports
     *		@param SSID			the SSID of the network enclosed in double quotes
     *		@param password		the password for the network enclosed in double quotes
     * 	@param algorithm	the authentication algorithm
     * 	@return	wifiConfig	a JSON object properly formatted for the plugin.
     */
    formatWifiConfig: function(SSID, password, algorithm) {
        var wifiConfig = {
            SSID: DeviceUtility.formatWifiString(SSID)
        };
        if (!algorithm && !password) {
            // open network
            wifiConfig.auth = {
                algorithm: 'NONE'
            };
        } else if (algorithm === 'WPA') {
            wifiConfig.auth = {
                algorithm : algorithm,
                password : DeviceUtility.formatWifiString(password)
                // Other parameters can be added depending on algorithm.
            };
        }
        else if (algorithm === 'New network type') {
            wifiConfig.auth = {
                algorithm : algorithm
                // Etc...
            };
        }
        else {
            console.log("Algorithm incorrect")
            return false;
        }
        return wifiConfig;
    },

    /**
     *	This method is a helper method that returns a wifi object with WPA.
     */
    formatWPAConfig: function(SSID, password) {
        return DeviceUtility.formatWifiConfig(SSID, password, 'WPA');
    },

    /**
     *	This method formats a given SSID and ensures that it is appropriate.
     *	If the SSID is not wrapped in double quotes, it wraps it in double quotes.
     * Despite the name, this also needs to be done to WPA PSK.
     *	@param	ssid	the SSID to format
     */
    formatWifiString: function(ssid) {
        if (ssid === undefined || ssid === null) {
            ssid = "";
        }
        ssid = ssid.trim()

        if (ssid.charAt(0) != '"' ) {
            ssid = '"' + ssid;
        }

        if (ssid.charAt(ssid.length-1) != '"' ) {
            ssid = ssid + '"';
        }

        return ssid;
    },

    /**
     * This methods adds a network to the list of available networks.
     * Currently, only WPA authentication method is supported.
     *
     * @param 	wifi is JSON formatted information necessary for adding the Wifi
     * 			network, as is done in formatWifiConfig.
     * @param 	win is a callback function that gets called if the plugin is
     * 			successful.
     * @param 	fail is a callback function that gets called if the plugin gets
     * 			an error
     */
    addNetwork: function(wifi, win, fail) {
        //console.log("DeviceUtility add method entered.");
        if (wifi !== null && typeof wifi === 'object') {
            // Ok to proceed!
        }
        else {
            console.log('DeviceUtility: Invalid parameter. wifi not an object.');
        }

        var networkInformation = [];

        if (wifi.SSID !== undefined && wifi.SSID !== '') {
            networkInformation.push(wifi.SSID);
        }
        else {
            // i dunno, like, reject the call or something? what are you even doing?
            console.log('DeviceUtility: No SSID given.');
            return false;
        }

        if (typeof wifi.auth == 'object') {

            switch (wifi.auth.algorithm) {
                case 'WPA':
                    networkInformation.push('WPA');
                networkInformation.push(wifi.auth.password);
                break;
                case 'NONE':
                    networkInformation.push('NONE');
                break;
                case 'Newly supported type':
                    // Push values in specific order, and implement new type in the Java code.
                    break;
                default:
                    console.log("DeviceUtility: authentication invalid.");
            }

        }
        else {
            console.log('DeviceUtility: No authentication algorithm given.');
            return false;
        }

        cordova.exec(win, fail, 'DeviceUtility', 'addNetwork', networkInformation);
    },

    /**
     *	This method removes a given network from the list of configured networks.
     *	@param	SSID	of the network to remove
     *	@param	win		function to handle successful callback
     *	@param	fail		function to handle error callback
     */
    removeNetwork: function(SSID, win, fail) {
        cordova.exec(win, fail, 'DeviceUtility', 'removeNetwork', [DeviceUtility.formatWifiString(SSID)]);
    },

    /**
     *	This method is to find specific SSID in the scanned network.
     *	@param	SSID	the network to find
     *	@param	win		function that is called if successful
     * @param	fail		function that is called to handle errors
     */
    findSSID: function(SSID, win, fail) {
        cordova.exec(win, fail, 'DeviceUtility', 'findSSID', [DeviceUtility.formatWifiString(SSID)]);
    },

    /**
     *	This method connects a network if it is configured.
     *	@param	SSID	the network to connect
     *	@param	win		function that is called if successful
     * @param	fail		function that is called to handle errors
     */
    connectNetwork: function(SSID, win, fail) {
        cordova.exec(win, fail, 'DeviceUtility', 'connectNetwork', [DeviceUtility.formatWifiString(SSID)]);
    },

    /**
     *	This method disconnects a network if it is configured.
     *	@param	SSID	the network to disconnect
     *	@param	win		function that is called if successful
     * @param	fail		function that is called to handle errors
     */
    disconnectNetwork: function(SSID, win, fail) {
        cordova.exec(win, fail, 'DeviceUtility', 'disconnectNetwork', [DeviceUtility.formatWifiString(SSID)]);

    },

    /**
     *	Hands the list of previously used and configured networks to the `win` success callback function.
     * @param 	win	callback function that receives list of networks
     * @param 	fail	callback function if error
     * @return		a list of networks
     */
    listNetworks: function(win, fail) {
        if (typeof win != "function") {
            console.log("listNetworks first parameter must be a function to handle list.");
            return;
        }
        cordova.exec(win, fail, 'DeviceUtility', 'listNetworks', []);
    },

	/**
	 *  Hands the list of scanned  networks to the `win` success callback function.
         * @param   opts optional json object of options
	 * @param 	win	callback function that receives list of networks
	 * @param 	fail	callback function if error
	 * @return		a list of networks
	 */
    getScanResults: function(options, win, fail) {
        if (typeof options === 'function') {
            fail = win;
            win = options;
            options = {};
        }

        if (typeof win != "function") {
            console.log("getScanResults first parameter must be a function to handle list.");
            return;
        }

        cordova.exec(win, fail, 'DeviceUtility', 'getScanResults', [options]);
    },

    /**
     *  Start scanning wifi.
     * @param 	win	callback function
     * @param 	fail	callback function if error
     */
    startScan: function(win, fail) {
        if (typeof win != "function") {
            console.log("startScan first parameter must be a function to handle list.");
            return;
        }
        cordova.exec(win, fail, 'DeviceUtility', 'startScan', []);
    },

    /**
     *  Disconnect current wifi.
     * @param 	win	callback function
     * @param 	fail	callback function if error
     */
    disconnect: function(win, fail) {
        if (typeof win != "function") {
            console.log("disconnect first parameter must be a function to handle list.");
            return;
        }
        cordova.exec(win, fail, 'DeviceUtility', 'disconnect', []);
    },

    /**
     *  Gets the currently connected wifi SSID
     * @param 	win	callback function
     * @param 	fail	callback function if error
     */
    getCurrentSSID: function(win, fail) {
        if (typeof win != "function") {
            console.log("getCurrentSSID first parameter must be a function to handle SSID.");
            return;
        }
        cordova.exec(win, fail, 'DeviceUtility', 'getConnectedSSID', []);
    },
    
    getCurrentBSSID: function(win, fail) {
        if (typeof win != "function") {
            console.log("getCurrentSSID first parameter must be a function to handle SSID.");
            return;
        }
        cordova.exec(win, fail, 'DeviceUtility', 'getConnectedBSSID', []);
    },

    /**
     *  Gets 'true' or 'false' if WiFi is enabled or disabled
     * @param 	win	callback function
     * @param 	fail
     */
    isWifiEnabled: function(win, fail) {
        if (typeof win != "function") {
            console.log("isWifiEnabled first parameter must be a function to handle wifi status.");
            return;
        }
        cordova.exec(
            // Cordova can only return strings to JS, and the underlying plugin
            // sends a "1" for true and "0" for false.
            function(result) {
                win(result == "1");
            },
            fail, 'DeviceUtility', 'isWifiEnabled', []
        );
    },

    /**
     *  Gets '1' if WiFi is enabled
     * @param   enabled	callback function
     * @param 	win	callback function
     * @param 	fail	callback function if wifi is disabled
     */
    setWifiEnabled: function(enabled, win, fail) {
        if (typeof win != "function") {
            console.log("setWifiEnabled second parameter must be a function to handle enable result.");
            return;
        }
        cordova.exec(win, fail, 'DeviceUtility', 'setWifiEnabled', [enabled]);
    },
    
    /*iOS only functions*/

    /**
     * Connect to network in iOS
     * @param ssid
     * @param ssidPassword
     * @param win
     * @param fail
     */
    iOSConnectNetwork: function (ssid, ssidPassword, win, fail) {
        cordova.exec(win, fail, "DeviceUtility", "connectNetwork", [
            {
                "Ssid": ssid,
                "Password": ssidPassword
            }]);
    }
};

module.exports = DeviceUtility;
