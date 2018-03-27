cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
  {
    "id": "cordova-plugin-device.device",
    "file": "plugins/cordova-plugin-device/www/device.js",
    "pluginId": "cordova-plugin-device",
    "clobbers": [
      "device"
    ]
  },
  {
    "id": "cordova-plugin-email.EmailComposer",
    "file": "plugins/cordova-plugin-email/www/email_composer.js",
    "pluginId": "cordova-plugin-email",
    "clobbers": [
      "cordova.plugins.email",
      "plugin.email"
    ]
  },
  {
    "id": "cordova-plugin-geolocation.Coordinates",
    "file": "plugins/cordova-plugin-geolocation/www/Coordinates.js",
    "pluginId": "cordova-plugin-geolocation",
    "clobbers": [
      "Coordinates"
    ]
  },
  {
    "id": "cordova-plugin-geolocation.PositionError",
    "file": "plugins/cordova-plugin-geolocation/www/PositionError.js",
    "pluginId": "cordova-plugin-geolocation",
    "clobbers": [
      "PositionError"
    ]
  },
  {
    "id": "cordova-plugin-geolocation.Position",
    "file": "plugins/cordova-plugin-geolocation/www/Position.js",
    "pluginId": "cordova-plugin-geolocation",
    "clobbers": [
      "Position"
    ]
  },
  {
    "id": "cordova-plugin-geolocation.geolocation",
    "file": "plugins/cordova-plugin-geolocation/www/geolocation.js",
    "pluginId": "cordova-plugin-geolocation",
    "clobbers": [
      "navigator.geolocation"
    ]
  },
  {
    "id": "cordova-plugin-splashscreen.SplashScreen",
    "file": "plugins/cordova-plugin-splashscreen/www/splashscreen.js",
    "pluginId": "cordova-plugin-splashscreen",
    "clobbers": [
      "navigator.splashscreen"
    ]
  },
  {
    "id": "cordova-plugin-statusbar.statusbar",
    "file": "plugins/cordova-plugin-statusbar/www/statusbar.js",
    "pluginId": "cordova-plugin-statusbar",
    "clobbers": [
      "window.StatusBar"
    ]
  },
  {
    "id": "deviceutility.DeviceUtility",
    "file": "plugins/deviceutility/www/DeviceUtility.js",
    "pluginId": "deviceutility",
    "clobbers": [
      "window.DeviceUtility"
    ]
  },
  {
    "id": "ionic-plugin-keyboard.keyboard",
    "file": "plugins/ionic-plugin-keyboard/www/ios/keyboard.js",
    "pluginId": "ionic-plugin-keyboard",
    "clobbers": [
      "cordova.plugins.Keyboard"
    ],
    "runs": true
  },
  {
    "id": "phonegap-plugin-barcodescanner.BarcodeScanner",
    "file": "plugins/phonegap-plugin-barcodescanner/www/barcodescanner.js",
    "pluginId": "phonegap-plugin-barcodescanner",
    "clobbers": [
      "cordova.plugins.barcodeScanner"
    ]
  },
  {
    "id": "phonegap-plugin-push.PushNotification",
    "file": "plugins/phonegap-plugin-push/www/push.js",
    "pluginId": "phonegap-plugin-push",
    "clobbers": [
      "PushNotification"
    ]
  },
  {
    "id": "cordova-plugin-ip-mac-address.addressimpl",
    "file": "plugins/cordova-plugin-ip-mac-address/www/addressimpl.js",
    "pluginId": "cordova-plugin-ip-mac-address",
    "clobbers": [
      "addressimpl"
    ]
  },
  {
    "id": "cz.blocshop.socketsforcordova.Socket",
    "file": "plugins/cz.blocshop.socketsforcordova/socket.js",
    "pluginId": "cz.blocshop.socketsforcordova",
    "clobbers": [
      "window.Socket"
    ]
  },
  {
    "id": "cordova-plugin-opensettings.Settings",
    "file": "plugins/cordova-plugin-opensettings/www/settings.js",
    "pluginId": "cordova-plugin-opensettings",
    "clobbers": [
      "cordova.plugins.settings"
    ]
  }
];
module.exports.metadata = 
// TOP OF METADATA
{
  "cordova-plugin-device": "2.0.1",
  "cordova-plugin-email": "1.2.6",
  "cordova-plugin-geolocation": "4.0.1",
  "cordova-plugin-splashscreen": "5.0.2",
  "cordova-plugin-statusbar": "2.4.1",
  "cordova-plugin-whitelist": "1.3.3",
  "deviceutility": "1.0.0",
  "ionic-plugin-keyboard": "2.2.1",
  "phonegap-plugin-barcodescanner": "7.0.2",
  "phonegap-plugin-push": "2.1.3",
  "cordova-plugin-ip-mac-address": "1.0.1",
  "cz.blocshop.socketsforcordova": "1.1.0",
  "cordova-plugin-opensettings": "1.3"
};
// BOTTOM OF METADATA
});