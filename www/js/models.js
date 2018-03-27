(function(){
	"use strict";
	
	window.PumpApp = window.PumpApp || {};
	
	var me = function() {
		this.name='';
		this.email='';
		this.zipcode='';
		this.allowlocation=null;
		this.wifiname='';
		this.wifipass='';
		this.wifipassexists=null;
		this.apptokenid='';
		this.appid='';
		this.deviceuuid='';
		this.platform='';
		this.model='';
		this.fcmtoken='';
		this.ipaddress='';
		this.init=false;
	};
	window.PumpApp.Me = me;

	const pump = {
		id:null,   //
		idAsNumber:-1,
		description:'', //
		imeid:'',
		serialno:'',
		lot : null,
		swVer : '',
		statusFlag : null,
		pumpData : null,

		error : '',
		error2 : '',
		name:'',  // ECO-FLO-serialending
		
		waterLvl : 0,
		lastCurr : 0,
		run : 0,
		gallons : 0,
		lifetime : 0,
		ac : 0,
		batV : 0,
		temp : 0,

		waterLevel : '',
		waterCurrent : '',
		runCycle : '',
		gallonsPumped : '',
		lifetimeCycle : '',
		acVoltage : '',
		batteryVoltage : '',
		roomTemperature : '',
		errorMessage : '',
		error2Message : '',

		statusList : null,
		
		serialending : '',  //
		macaddress : '',  //
		wifiipaddress : '', //
		connectiondata: ''
	};

	
	var errorCodes = {
		'01' : 'Water level too high',
		'11' : 'Pump is on',
		'21' : 'Pump disconnected / low current',
		'22' : 'Pump current too high',
		'31' : 'Relay malfunctioned',
		'41' : 'Sensor disconnected',
		'51' : 'AC power lost',
		'52' : 'AC power too high',
		'53' : 'AC power too low',
		'62' : 'Battery low',
		'63' : 'Battery critically low',
		'64' : 'Battery disconnected',
		'65' : 'Battery dead',
		'71' : 'Room temperature high',
		'72' : 'Room temperature low',
		'81' : 'Cellular signal low',
		'91' : 'Lost connection to cloud',
		'a1' : 'Is unlocked',
		'b1' : 'Alarm input is on',
		'c1' : 'pump disconnected or current too low',
		'c2' : 'pump current too high'
	};
	window.PumpApp.ErrorCodes = errorCodes;


	window.PumpApp.Pump = pump;
	window.PumpApp.PumpUtil = {};
	window.PumpApp.PumpUtil.create = function() {
		var newPump = Object.create(PumpApp.Pump);
		return newPump;
	};
	window.PumpApp.PumpUtil.createFromData = function(data) {
//alert('>>>>>in createFromData.data.length=!!!!'+ data.length);
		var newPump = Object.create(PumpApp.Pump);
		newPump.id=data[1];
		newPump.idAsNumber=parseInt(newPump.id.slice(2,6), 16);
//alert('newPump.id='+newPump.id+', idAsNumber='+newPump.idAsNumber);
		newPump.description='Test description';
		newPump.imeid=data[2].slice(2, 18).toUpperCase();
		newPump.serialno=PumpApp.Utils.toASCII(data[4]) + 'C' + PumpApp.Utils.padLeft(parseInt(data[5], 16));
		newPump.lot = data[4];
        newPump.swVer = parseInt(data[6].slice(2, 6), 16) / 100 + '.' + parseInt(data[6].slice(7, 10), 16) / 100;
        newPump.statusFlag = data[7];
//alert('>>>>10, serialno='+newPump.serialno);
	if (data[8].length > 0) {
	        newPump.pumpData = data[8].slice(2, data[8].length);

		////////////////////////////////////////////////////////////////////////////////
		newPump.temp = parseInt(newPump.pumpData.slice(0, 4), 16) / 10;
		newPump.batV = parseInt(newPump.pumpData.slice(4, 8), 16) / 10;
		newPump.lastCurr = parseInt(newPump.pumpData.slice(8, 12), 16) / 10;
		newPump.ac = parseInt(newPump.pumpData.slice(12, 16), 16);
		newPump.waterLvl = parseInt(newPump.pumpData.slice(16, 20), 16) / 10;
		newPump.statusList = PumpApp.Utils.toSomething(newPump.pumpData.slice(20, 24), 16).split('');
//alert('>>>>11, serialno='+newPump.serialno);

		newPump.error = newPump.pumpData.slice(24, 26);
		newPump.error2 = newPump.pumpData.slice(26, 28);
		newPump.lifetime = parseInt(newPump.pumpData.slice(28, 36), 16);
		newPump.gallons = parseInt(newPump.pumpData.slice(36, 40), 16);
		newPump.run = parseInt(newPump.pumpData.slice(40, 44), 16);
		////////////////////////////////////////////////////////////////////////////////
	}

//alert('>>>>12, serialno='+newPump.serialno);

		newPump.name=PumpApp.Constants.SerialPrefix+newPump.serialno.slice(-4);
		newPump.waterLevel = newPump.waterLvl + ' Inches';	
		newPump.waterCurrent = newPump.lastCurr + ' G/M';
		newPump.runCycle = newPump.run + '';
		newPump.gallonsPumped = newPump.gallons + ' G';
		newPump.lifetimeCycle = newPump.lifetime + '';
		newPump.acVoltage = newPump.ac + ' V';
		newPump.batteryVoltage = newPump.batV + ' V';
		newPump.roomTemperature = newPump.temp + ' F';

//alert('>>>>13, error='+newPump.error);
		if (errorCodes[newPump.error] === undefined
			&& newPump.error !== '') {
				newPump.errorMessage = 'Unknown (0x'+newPump.error+')';
		} else newPump.errorMessage = errorCodes[newPump.error];
//alert('>>>>14, error2='+newPump.error2);
		if (errorCodes[newPump.error2] === undefined
			&& newPump.error2 !== '') { 
				newPump.error2Message = 'Unknown (0x'+newPump.error2+')';
		} else newPump.error2Message = errorCodes[newPump.error2];
//alert('<<<<<in createFromData!!!!');
		return newPump;
	};

///////////////////////////////////////////////////////////
	window.PumpApp.PumpUtil.updateFromData = function(refpump, data) {
		refpump.idAsNumber=parseInt(refpump.id.slice(2,6), 16);
//alert('refpump.id='+refpump.id+', idAsNumber='+refpump.idAsNumber);
		refpump.imeid=data[2].slice(2, 18).toUpperCase();
		refpump.serialno=PumpApp.Utils.toASCII(data[4]) + 'C' + PumpApp.Utils.padLeft(parseInt(data[5], 16));
		refpump.lot = data[4];
        refpump.swVer = parseInt(data[6].slice(2, 6), 16) / 100 + '.' + parseInt(data[6].slice(7, 10), 16) / 100;
        refpump.statusFlag = data[7];
//alert('>>>>10, serialno='+refpump.serialno);
	if (data[8].length > 0) {
		refpump.pumpData = data[8].slice(2, data[8].length);

		////////////////////////////////////////////////////////////////////////////////
		refpump.temp = parseInt(refpump.pumpData.slice(0, 4), 16) / 10;
		refpump.batV = parseInt(refpump.pumpData.slice(4, 8), 16) / 10;
		refpump.lastCurr = parseInt(refpump.pumpData.slice(8, 12), 16) / 10;
		refpump.ac = parseInt(refpump.pumpData.slice(12, 16), 16);
		refpump.waterLvl = parseInt(refpump.pumpData.slice(16, 20), 16) / 10;
		refpump.statusList = PumpApp.Utils.toSomething(refpump.pumpData.slice(20, 24), 16).split('');
		refpump.error = refpump.pumpData.slice(24, 26);
		refpump.error2 = refpump.pumpData.slice(26, 28);
		refpump.lifetime = parseInt(refpump.pumpData.slice(28, 36), 16);
		refpump.gallons = parseInt(refpump.pumpData.slice(36, 40), 16);
		refpump.run = parseInt(refpump.pumpData.slice(40, 44), 16);
		////////////////////////////////////////////////////////////////////////////////
		}
//alert('>>>>11, serialno='+refpump.serialno);
		refpump.waterLevel = refpump.waterLvl + ' Inches';	
		refpump.waterCurrent = refpump.lastCurr + ' G/M';
		refpump.runCycle = refpump.run + '';
		refpump.gallonsPumped = refpump.gallons + ' G';
		refpump.lifetimeCycle = refpump.lifetime + '';
		refpump.acVoltage = refpump.ac + ' V';
		refpump.batteryVoltage = refpump.batV + ' V';
		refpump.roomTemperature = refpump.temp + ' F';
//alert('>>>>12, serialno='+refpump.serialno);
		if (errorCodes[refpump.error] === undefined
			&& refpump.error !== '') {
				refpump.errorMessage = 'Unknown (0x'+refpump.error+')';
		} else refpump.errorMessage = errorCodes[refpump.error];

		if (errorCodes[refpump.error2] === undefined
			&& refpump.error2 !== '') {
				refpump.error2Message = 'Unknown (0x'+refpump.error2+')';
		} else refpump.error2Message = errorCodes[refpump.error2];
//alert('>>>>13, serialno='+refpump.serialno);
	};
//////////////////////////////////////////////////////////////////
	
	var message = function(msg) {
		this.datetime = PumpApp.Utils.utcNowAsString();
		this.message = msg.message;
		this.unread = true;
		this.isAlert = false;
		this.pumpIdentity = msg.pumpIdentity;
		if (angular.isDefined(msg.isAlert)) {
			this.isAlert = msg.isAlert;
		}
		this.senderIsPump = true;
		if (angular.isDefined(msg.senderIsPump)) {
			this.senderIsPump = msg.senderIsPump;
		}
	};
	window.PumpApp.Message = message;

	var pumpConstants = {
		//RequestUrl: "http://207.135.172.62:8090/AVAT_DB/ACTION",
		RequestUrl: "http://34.228.8.148:8090/AVAT_DB/ACTION",
		SerialPrefix: 'ECO-FLO-',
		PumpApIpAddress: '192.168.4.1',
		PumpApPortNo: 333
	};
	window.PumpApp.Constants = pumpConstants;
})();
