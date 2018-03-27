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
		
		this.init=false;
	};
	window.PumpApp.Me = me;
	
	const pump = {
		id:null,
		idAsNumber:-1,
		description:'',
		imeid:'',
		serialno:'',
		lot : null,
        swVer : '',
        statusFlag : null,
        pumpData : null,
        temp : 0,
        batV : 0,
        waterLvl : 0,
        statusList : null,
        lastCurr : 0,
        error : '',
		name:'',
		
		roomTemperature : '',
		batteryVoltage : '',
		waterLevel : '',
		waterCurrent : '',
		
		serialending : '',
		macaddress : '',
		connectiondata: ''
	};
	window.PumpApp.Pump = pump;
	window.PumpApp.PumpUtil = {};
	window.PumpApp.PumpUtil.create = function() {
		var newPump = Object.create(PumpApp.Pump);
		return newPump;
	};
	window.PumpApp.PumpUtil.createFromData = function(data) {
		var newPump = Object.create(PumpApp.Pump);
		newPump.id=data[1];
		newPump.idAsNumber=parseInt(newPump.id);
		newPump.description='Test description';
		newPump.imeid=data[2].slice(2, 18).toUpperCase();
		newPump.serialno=PumpApp.Utils.toASCII(data[4]) + 'C' + PumpApp.Utils.padLeft(parseInt(data[5], 16));
		newPump.lot = data[4];
        newPump.swVer = parseInt(data[6].slice(2, 6), 16) / 100 + '.' + parseInt(data[6].slice(7, 10), 16) / 100;
        newPump.statusFlag = data[7];
        newPump.pumpData = data[8];
        newPump.temp = parseInt(newPump.pumpData.slice(2, 6), 16) / 10;
        newPump.batV = parseInt(newPump.pumpData.slice(6, 8), 16) / 10;
        newPump.waterLvl = parseInt(newPump.pumpData.slice(8, 12), 16) / 10;
        newPump.statusList = PumpApp.Utils.toSomething(newPump.pumpData.slice(12, 16), 16).split('');
        newPump.lastCurr = parseInt(newPump.pumpData.slice(16, 18), 16) / 10;
        newPump.error = newPump.pumpData.slice(18, 20);
		newPump.name=PumpApp.Constants.SerialPrefix+newPump.serialno.slice(-6);
		
		newPump.roomTemperature = newPump.temp + '° F';
		newPump.batteryVoltage = newPump.batV + ' V';
		newPump.waterLevel = newPump.waterLvl + ' Inches';
		newPump.waterCurrent = newPump.lastCurr + ' A';
		
		return newPump;
	};
	window.PumpApp.PumpUtil.updateFromData = function(refpump, data) {
		refpump.idAsNumber=parseInt(refpump.id);
		refpump.imeid=data[2].slice(2, 18).toUpperCase();
		refpump.serialno=PumpApp.Utils.toASCII(data[4]) + 'C' + PumpApp.Utils.padLeft(parseInt(data[5], 16));
		refpump.lot = data[4];
        refpump.swVer = parseInt(data[6].slice(2, 6), 16) / 100 + '.' + parseInt(data[6].slice(7, 10), 16) / 100;
        refpump.statusFlag = data[7];
        refpump.pumpData = data[8];
        refpump.temp = parseInt(refpump.pumpData.slice(2, 6), 16) / 10;
        refpump.batV = parseInt(refpump.pumpData.slice(6, 8), 16) / 10;
        refpump.waterLvl = parseInt(refpump.pumpData.slice(8, 12), 16) / 10;
        refpump.statusList = PumpApp.Utils.toSomething(refpump.pumpData.slice(12, 16), 16).split('');
        refpump.lastCurr = parseInt(refpump.pumpData.slice(16, 18), 16) / 10;
        refpump.error = refpump.pumpData.slice(18, 20);
		
		refpump.roomTemperature = refpump.temp + '° F';
		refpump.batteryVoltage = refpump.batV + ' V';
		refpump.waterLevel = refpump.waterLvl + ' Inches';
		refpump.waterCurrent = refpump.lastCurr + ' A';
	};
	
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
	
	
	var errorCodes = {
		'01': 'Water level too high',
		11 : 'Pump is on',
		21 : 'Pump disconnected / low current',
		22 : 'Pump current too high',
		31 : 'Relay malfunctioned',
		41 : 'Sensor disconnected',
		51 : 'AC power lost',
		52 : 'AC power too high',
		53 : 'AC power too low',
		62 : 'Battery low',
		63 : 'Battery critically low',
		64 : 'Battery disconnected',
		65 : 'Battery dead',
		71 : 'Room temperature high',
		72 : 'Room temperature low',
		81 : 'Cellular signal low',
		91 : 'Lost connection to cloud',
		a1: 'Is unlocked',
		b1: 'Alarm input is on'
	};
	window.PumpApp.ErrorCodes = errorCodes;
	
	var pumpConstants = {
		SerialPrefix: 'ECO-FLO-'
	};
	window.PumpApp.Constants = pumpConstants;
})();
