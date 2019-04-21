'use strict';

// require library
const wifi = require('../lib/wifi_location');

// api name and api token for wigle.net
const credendials = require('./credendials.json');

// initialize library
wifi.init({
    api_name : credendials.api_name,
    api_token: credendials.api_token
});


// test data
const bssid_list = [
    'F8:3D:FF:BB:BA:29',
    '00:24:8C:93:A4:FC',
];


for (const bssid of bssid_list) {
    wifi.mylnikov(bssid)
        .then(coords => {
            console.log(`mylnikov:`);
            console.log(JSON.stringify(coords, null, 4));
        })
        .catch(err => {
            console.log(`mylnikov ERROR:`);
            console.log(err);
        });

    wifi.wigle(bssid)
        .then(coords => {
            console.log(`wigle:`);
            console.log(JSON.stringify(coords, null, 4));
        })
        .catch(err => {
            console.log(`wigle ERROR:`);
            console.log(err);
        });
}
