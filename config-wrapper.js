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

//var mqtt = require('mqtt');
var mqtt = require('ibmiotf'); //https://www.npmjs.com/package/ibmiotf
var properties = require('properties');

function start(deviceId, apiKey, apiToken, mqttHost, mqttPort, carid, startlane, devicetype, authtoken, callback) {
  
  console.log("deviceId:",deviceId );
  console.log("deviceId:",authtoken );
  console.log("apiKey:", apiKey );
  console.log("apiToken:", apiToken );
  console.log("mqttHost:", mqttHost );
  console.log("mqttPort:", mqttPort );
  console.log("carid:", carid );
  console.log("startlane:", startlane );
  console.log("devicetype:", devicetype );

  var org = apiKey.split('-')[1];
  var clientId = ['d', org, devicetype, deviceId].join(':');
  var command = "car";

  console.log("Connection string: " + "mqtt://" + mqttHost + ":" + mqttPort);

  var config = {
    "org" : org,
    "id" : deviceId,
    "domain": "internetofthings.ibmcloud.com",
    "type" : devicetype,
    "auth-method" : "token",
    "auth-token" : authtoken,
    "use-client-certs": false,
  };
  
  /*
  var mqttClient = mqtt.connect("mqtt://" + mqttHost + ":" + mqttPort, {
              "clientId" : clientId,
              "keepalive" : 30,
              "username" : "use-token-auth",
              //"username" : apiKey,
              "password" : apiToken
              //"useSSL": true
            });
  */
  var mqttClient = new mqtt.IotfDevice(config);
  
  mqttClient.connect();

  mqttClient.on('connect', function() {
    console.log("mqtt client on connected");  
    // mqttClient.publish("status","json",'{"d" : { "cpu" : 60, "mem" : 50 }}');

    /*
    mqttClient.subscribe('iot-2/cmd/'+command+'/fmt/json', {qos : 0}, function(err, granted) {
      if (err) {
        console.log('MQTT client is not connected to IBM IoT Cloud:', err);
        mqttClient = null;
      } 
      else {
        console.log('MQTT client connected to IBM IoT Cloud');
      }
    });
    */

    callback(carid, startlane, mqttClient);
  });

  // callback(carid, startlane, mqttClient);
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
        console.log("authtoken:",cfg.authtoken);
        console.log("APIKey:",cfg.apikey);
        console.log("APIToken:",cfg.apitoken);

        if (cfg.deviceid) {
          var org = cfg.apikey.split('-')[1];
          console.log('Start connection to IBM IoT:',org);
          start(cfg.deviceid, cfg.apikey, cfg.apitoken, org + '.messaging.internetofthings.ibmcloud.com', '1883', cfg.carid, cfg.startlane, cfg.devicetype, cfg.authtoken, callback);

        } else {
          callback(cfg.carid, cfg.startlane, null);
        }
      });	
	  }
  };
};