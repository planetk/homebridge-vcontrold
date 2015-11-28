# homebridge-vcontrold

This is a plugin for [homebridge](https://github.com/nfarina/homebridge). It provides access to a Viessmann heating unsing the [vcontrold](https://openv.wikispaces.com/vcontrold) demon.
 
# Prerequisits
In order to use this plugin you need to connect your heating to a linux computer using the IR Interface of the heating. On that computer you need to set up the [vcontrold](https://openv.wikispaces.com/vcontrold) demon.

Details on hardware and software setup are available on the [openv](https://openv.wikispaces.com) Homepage.

I will not be responsible for anything that happens to your heating due to using this software. You do this on your own risk. I will also not be able to give any support for the setup ov vcontrold.

Please note the IP address and port vcontrold is running on. Check vcontrold.xml to find the port. Default is 3002.

# Installation

1. Install homebridge using: npm install -g homebridge
2. Install this plugin using: npm install -g homebridge-vcontrold
3. Update your configuration file (~/.homebridge/config.json). See following Configuration Chapter for details

# Configuration

## Example

 ```
"platforms": [
        {
            "platform": "vcontrold",
            "name" : "Viessmann heating via vcontrold",
            "host" : "192.168.1.111",
            "port" : 3002,
            "accessories": [
              {
                "name": "Outdoor Sensor Heating",
                "type": "Temperature",
                "commands": {
                  "current" : "getTempA"
                }
              },
              {
                "name": "Warm water (Heating)",
                "type": "Thermostat",
                "commands": {
                  "get": "getTempWWsoll",
                  "set": "setTempWWsoll",
                  "current": "getTempWWist"
                }
              },
              {
                "name": "Roomtemperature (Heating)",
                "type": "Thermostat",
                "commands": {
                  "get": "getTempRaumNorSollM2",
                  "set": "setTempRaumNorSollM2"
                }
              },
              {
                "name": "Partymode (Heating)",
                "type": "Switch",
                "commands": {
                  "get": "getBetriebPartyM2",
                  "set": "setBetriebPartyM2"
                }
              },
              {
                "name": "Eco-mode (Heating)",
                "type": "Switch",
                "commands": {
                  "get": "getBetriebSparM2",
                  "set": "setBetriebSparM2"
                }
              }
            ]
        }
    ]

}

```

## Description

### General settings

Change name to your needs.
Change host and port according to you vcontrold settings.
Don't chang the platform setting.

### Accessories

The plugin currently supports following differnt types of accessories. For each accessory a name, a type and a mapping to differen vcontrold commands needs to be defined.

The name of an accessory is up to your choice.
The different types and there specific command mapping are described in the following chapters.

** Please be cautious when doing the configuration. Very little checking is done on your configuration! **

### Temperature accessories (Temperature)

This type allows you to get the Value of the different temperature sensors of the heating.

You need to provide the name of the vcontrold command, which is used to retrieve the current value of the sensor. E.g. 

```
	"commands": {
        "current" : "getTempA"
    }
```

Gives the value measured by the outdoor sensor.

### Thermostat accessories (Thermostat)

This type allows you not only to get the current value of a temperature sensor. It also allows to get and set a target value of the temperature.

In case you do not provide a mapping for "current" the target temperature will be given as current.

```
	"commands": {
        "get": "getTempWWsoll",
        "set": "setTempWWsoll",
        "current": "getTempWWist"
    }
```

Provides support to read/set boiler target temperature and read the current value of the boiler temperature.

### Switch accessories (Switch)

This type allows you to toggle (on/off) features of the heating.

```
    "commands": {
        "get": "getBetriebPartyM2",
        "set": "setBetriebPartyM2"
    }
```
Controls the party mode for heating circuit 2.

## Author

- Stefan Kuper / [planetk](https://github.com/planetk)



