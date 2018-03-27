(function(){
	"use strict";
	
	var utils = {};
	
	utils.parseInt = function(data) {
		return parseInt(data);
	};
	
	utils.padLeft = function(data) {
		var paddedStr = "000000".substr(data.toString().length) + data;
		return paddedStr;
	};
	
	utils.toASCII = function(data) {
		for (var t = data.toString(), i = "", a = 0; a < t.length; a += 2) i += String.fromCharCode(parseInt(t.substr(a, 2), 16));
		var i = i.replace(/\0/g, "");
		return i;
	};
	
	utils.toSomething = function(e, t) {
//alert('toSomething e:'+e+', i:'+parseInt(e, 16)+', i2:'+parseInt(e, 16).toString(2));

		var i = parseInt(e, 16).toString(2);
//alert('toSomething FINAL:'+"0000000000000000".substr(i.length)+i);
		return 16 == t ? i = "0000000000000000".substr(i.length) + i: 8 == t && (i = "00000000".substr(i.length) + i),
		i
	};
	
	utils.utcNowAsString = function() {
		return moment.utc().format('MM DD YYYY HH:mm:ss ZZ');
	};
	
	utils.utcStringAsLocalTimeString = function(utcDtString) {
		return moment(utcDtString, 'MM DD YYYY HH:mm:ss ZZ').toDate().toLocaleString();
	};
	
	utils.isPhone = function() {
		return navigator.userAgent.match(/(iPhone|iPod|iPad|Android)/);
	};
	
	utils.isIPhone = function() {
		return navigator.userAgent.match(/(iPhone|iPod|iPad)/);
	};
	
	utils.isAndroid = function() {
		return navigator.userAgent.match(/(Android)/);
	};
	
	utils.isDemo = function() {
		return false;
	};
	
	utils.isDemo20180322 = function() {
		return true;
	};
	
	utils.formatUint8Array = function(dataString) {
		var data = new Uint8Array(dataString.length);
		for (var i = 0; i < data.length; i++) {
		  data[i] = dataString.charCodeAt(i);
		}
		return data;
	};

	utils.inlineAllSvgImg = function() {
		$('.pumpsvg').each(function(i,el) {
			$(el).removeClass('pumpsvg');
			var encodedSvg = $(el).css('content').replace('url("data:image/svg+xml,','');
			encodedSvg = encodedSvg.substr(0,encodedSvg.length-2);
			if (encodedSvg === ''){return;}
			var decodedSvg = unescape(encodedSvg);
			var parser = new DOMParser();
			var doc = parser.parseFromString(decodedSvg, "image/svg+xml");
			var svgRoot = doc.getElementsByTagName("svg")[0];
			var svgImg = $(el)[0];
			var attributes = svgImg.attributes;
			
			Array.prototype.slice.call(attributes).forEach(function(attribute) {
				if(attribute.name !== 'src' && attribute.name !== 'alt') {
					svgRoot.setAttribute(attribute.name, attribute.value);
				}
			});
			
			svgImg.parentNode.replaceChild(svgRoot, svgImg);
		});
	};

	window.PumpApp = window.PumpApp || {};
	window.PumpApp.Utils = utils;
})();
