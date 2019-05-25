# Description

Library can get location of Wi-Fi access points.

Library can use open and completely free [Mylnikov](https://www.mylnikov.org/)
service, [3WiFi](https://3wifi.stascorp.com/) and limited
[wigle.net](https://wigle.net/) (you need to regigter there) if you want to use
it.


# Installation

You can install it with this command:

    npm install locate_wifi


# Usage

First require library:

```JavaScript
const wifi = require('locate_wifi');
```

If you want to use OpenCellId, Mozilla Location Service or set custom socket
timeout, you should initialize library before using:

```JavaScript
wifi.init({
    // API keys
    api_name : 'you should sign up on https://wigle.net/ to get this',
    api_token: 'you should sign up on https://wigle.net/ to get this',
    api_key  : 'you should sign up on https://3wifi.stascorp.com/ to get this',

    // socket timeout in milliseconds (default is 3000)
    'timeout': 3000
});
```


Then perform requests the following way:

```JavaScript
bssid = 'F8:3D:FF:BB:BA:29';

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

wifi['3wifi'](bssid)
    .then(coords => {
        console.log(`3wifi:`);
        console.log(JSON.stringify(coords, null, 4));
    })
    .catch(err => {
        console.log(`3wifi ERROR:`);
        console.log(err);
    });


// result of every call will be like this:
// {
//    "lat"  : 59.31150685708,
//    "lon"  : 18.07485943715,
//    "ssid" : "Tele2Internet-F0029", // will be null in wifi.mylnikov()
//    "range": 141                    // will be null in wifi.wigle() and wifi['3wifi']()
// }
```


@license MIT \
@version 1.0.4 \
@author Alexander Russkiy <developer@xinit.ru>
