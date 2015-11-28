'use strict';

var Service, Characteristic;

module.exports = function(homebridge) {

  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerPlatform("homebridge-vcontrold", "vcontrold", VcontroldPlatform);
}

var telnet = require('telnet-client');

function VcontroldAPI(log, host, port) {
  this.log = log;
  var that=this;
  this.params = {
    host: host,
    port: port,
    shellPrompt: 'vctrld>',
    timeout: 1500,
    irs: "\n",
    ors: "\n",
    echoLines: 0
  };
}


VcontroldAPI.prototype = {

  call: function(command, callback) {
    var that = this;
    var connection = new telnet();
    connection.on('ready', function(prompt) {
      connection.exec(command, function(err, response) {
        callback(err, response);
      });
      connection.end();
    });

    connection.connect(this.params);
  }
}

function VcontroldPlatform(log, config) {
  this.log = log;
  this.accessory_conf = config["accessories"];
  this.api = new VcontroldAPI(this-log, config["host"], config["port"])
}

VcontroldPlatform.prototype = {
  accessories: function(callback) {

    var foundAccessories = [];

    for (var conf of this.accessory_conf) {
      foundAccessories.push(new VcotroldAccessory(this.log, conf, this.api));
    }
    callback(foundAccessories);
  }
}

function VcotroldAccessory(log, config, api) {
  this.log = log;
  this.config = config;
  this.name = config.name
  this.api = api;
}

VcotroldAccessory.prototype = {

  identify: function(callback) {
    this.log("Identify requested!");
    callback(); // success
  },

  currentTemperature: function (callback) {
    this.api.call(this.config.commands.current, function(error, response) {
      if (error) {
        callback(error, null);
      } else {
        callback(null, parseFloat(response));
      }
    }.bind(this));
  },

  getTargetTemperature: function (callback) {
    this.api.call(this.config.commands.get, function(error, response) {
      if (error) {
        callback(error, null);
      } else {
        callback(null, parseFloat(response));
      }
    }.bind(this));
  },

  setTargetTemperature: function (temp, callback) {
    var cmd = this.config.commands.set + " " + temp;
    this.api.call(cmd, function(error, response) {  
    if (error) {
        callback(error);
      } else {
        callback();
      }
    }.bind(this));
  },

  getSwitchState: function (callback) {
    this.api.call(this.config.commands.get, function(error, response) {
      if (error) {
        callback(error, null);
      } else {
        callback(null, response=="1");
      }
    }.bind(this));
  },
  setSwitchState: function(powerOn, callback) {
    var cmd = this.config.commands.set + " " + (powerOn?"1":"0");
    this.api.call(this.config.commands.set + " " + (powerOn?"1":"0"), function(error, response) {
      if (error) {
        callback(error);
      } else {
        callback();
      }
    }.bind(this));
  },
  getServices: function() {
    var that = this;
    var services = [];

    this.log("creating services for " + this.name)

    // INFORMATION ///////////////////////////////////////////////////

    var informationService = new Service.AccessoryInformation();
    services.push( informationService );
    
    informationService
      .setCharacteristic(Characteristic.Manufacturer, "Viessmann")
      .setCharacteristic(Characteristic.Model, "Vcontrold")
      .setCharacteristic(Characteristic.Name, this.name)

    // TEMPERATURE //////////////////////////////////////////////////
    if (this.config.type == "Temperature" && this.config.commands.current) {
      var temperatureSensor = new Service.TemperatureSensor(this.name + " Temperature");
      services.push( temperatureSensor );
      var tmpChar = temperatureSensor.getCharacteristic(Characteristic.CurrentTemperature)
      tmpChar.setProps({ minValue: -100 });
      tmpChar.on('get', this.currentTemperature.bind(this));
    }

    // THERMOSTAT //////////////////////////////////////////////////
    if (this.config.type == "Thermostat") {
      var thermostat = new Service.Thermostat(this.name + " Thermostat");
      services.push( thermostat );
      if (this.config.commands.get) {
        var tmpChar = thermostat.getCharacteristic(Characteristic.TargetTemperature)
        tmpChar.setProps({ minValue: 0, maxValue: 100.0 });
        tmpChar.on('get', this.getTargetTemperature.bind(this));
      }
      if (this.config.commands.current) {
        thermostat.getCharacteristic(Characteristic.CurrentTemperature)
          .on('get', this.currentTemperature.bind(this));
      } else if (this.config.commands.get) {
        thermostat.getCharacteristic(Characteristic.CurrentTemperature)
          .on('get', this.getTargetTemperature.bind(this));
      }
      if (this.config.commands.set) {
        thermostat.getCharacteristic(Characteristic.TargetTemperature)
          .on('set', this.setTargetTemperature.bind(this));
      }
    }

    // Switch //////////////////////////////////////////////////
    if (this.config.type == "Switch") {
      var switchService = new Service.Switch(this.name + " Switch");
      services.push( switchService );
      if (this.config.commands.get) {
        switchService.getCharacteristic(Characteristic.On)
          .on('get', this.getSwitchState.bind(this));
      }
      if (this.config.commands.set) {
        switchService.getCharacteristic(Characteristic.On)
          .on('set', this.setSwitchState.bind(this));
      }
    }

    return services;

  }
}
