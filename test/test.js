'use strict';

// require library
const wifi = require('../lib/index');

// api name and api token for wigle.net
const credendials = require('./credendials.json');

// initialize library
wifi.init({
    api_name : credendials.api_name,
    api_token: credendials.api_token,
    api_key  : credendials['3wifi_token']
});


// test data
const bssid_list = [
    'F8:3D:FF:BB:BA:29',
    '00:24:bc:93:a4:fc',
    '000C42F9C701',
    'D4 6A A8 0F 10 22',
    '4C-5E-0C-36-62-B3',
];


for (const bssid of bssid_list) {
    wifi.mylnikov(bssid)
        .then(coords => {
            console.log(`mylnikov ${bssid}:`);
            console.log(JSON.stringify(coords, null, 4));
        })
        .catch(err => {
            console.log(`mylnikov ERROR ${bssid}:`);
            console.log(err);
        });

    wifi['3wifi'](bssid)
        .then(coords => {
            console.log(`3wifi ${bssid}:`);
            console.log(JSON.stringify(coords, null, 4));
        })
        .catch(err => {
            console.log(`3wifi ERROR ${bssid}:`);
            console.log(err);
        });

    wifi.wigle(bssid)
        .then(coords => {
            console.log(`wigle ${bssid}:`);
            console.log(JSON.stringify(coords, null, 4));
        })
        .catch(err => {
            console.log(`wigle ERROR ${bssid}:`);
            console.log(err);
        });
}
