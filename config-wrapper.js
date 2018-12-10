//------------------------------------------------------------------------------
// Copyright IBM Corp. 2015, 2016
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//------------------------------------------------------------------------------

var mqtt = require('mqtt');
var properties = require('properties');

function start(deviceId, apiKey, apiToken, mqttHost, mqttPort, carid, startlane, devicetype, callback) {
  
  console.log("deviceId:",deviceId );
  console.log("apiKey:",apiKey );
  console.log("apiToken:", apiToken );
  console.log("mqttHost:", mqttHost );
  console.log("mqttPort:", mqttPort );
  console.log("carid:", startlane );
  console.log("deviceType:", devicetype );

  var org = apiKey.split('-')[1];
  var clientId = ['d', org, devicetype, deviceId].join(':');
  var command = "car";

  console.log("Connection string: " + "mqtt://" + mqttHost + ":" + mqttPort);
  var mqttClient = mqtt.connect("mqtt://" + mqttHost + ":" + mqttPort, {
              "clientId" : clientId,
              "keepalive" : 30,
              //"username" : "use-token-auth",
              "username" : "a-04glwq-wd6omfvnir",
              "password" : apiToken
            });

  console.log("Status:",mqttClient.connected);

  mqttClient.on('connect', function() {
    console.log("mqtt client on connect");
    console.log("Status:",mqttClient.connected);
    
    mqttClient.subscribe('iot-2/cmd/'+command+'/fmt/json', {qos : 0}, function(err, granted) {
      if (err) {
        console.log('MQTT client is not connected to IBM IoT Cloud');
        mqttClient = null;
      } 
      else {
        console.log('MQTT client connected to IBM IoT Cloud');
      }
    });

    callback(carid, startlane, mqttClient);
  });

  callback(carid, startlane, mqttClient);
}

module.exports = function() {
  return {
    "read" : function(propertiesFileName, callback) {
      console.log("Properties file name:", propertiesFileName);
      //callback('3dab011798b14eedbb94ff1c07d44bfc', '3', null)

      if (!propertiesFileName) {
        propertiesFileName = 'config-gs.properties';
        console.error("Default configuration file " + propertiesFileName + " is used");
      }

      properties.parse('./' + propertiesFileName, {path: true}, function(err, cfg) {
        console.log("Properties" + propertiesFileName + "parse");

        if (err) {
          console.error('Error parsing the configuration file - see config-sample.properties for an example');
          process.exit(0);
        }
        
        if (!cfg.carid) {
          console.error('Error parsing the configuration file - see config-sample.properties for an example');
          process.exit(0);
        }

        console.log("Carid:",cfg.carid);
        console.log("Deviceid:",cfg.deviceid);
        console.log("DeviceType:",cfg.devicetype);

        if (cfg.deviceid) {
          var org = cfg.apikey.split('-')[1];
          console.log('Starting connection to IoT: ',org);
          start(cfg.deviceid, cfg.apikey, cfg.authtoken, org + '.messaging.internetofthings.ibmcloud.com', '1883', cfg.carid, cfg.startlane, cfg.devicetype, callback);

        } else {
          callback(cfg.carid, cfg.startlane, null);
        }
      });	
	  }
  };
};