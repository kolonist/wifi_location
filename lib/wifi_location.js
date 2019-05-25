'use strict'

const https = require('https');


// wigle.net API tokens
let API_NAME  = '';
let API_TOKEN = '';

// 3wifi API key (guest API key used by default)
let API_KEY = '23ZRA8UBSLsdhbdJMp7IpbbsrDFDLuBC';

// Connection timeout, ms
let CONNECTION_TIMEOUT = 3000;

// Use only open data (need for mylnikov.org)
let DATA_OPEN = true;

// error messages
const E_NOTFOUND = 'BSSID not found';
const E_REQERROR = 'Request error';


// User-Agent string for requests
const USER_AGENT = 'xinitbot/1.0.4 (+https://xinit.ru/)';


/**
 * Initialize library with API name and token for wigle.net service, API key for
 * 3wifi service and connection timeout in milliseconds for network requests.
 *
 * If you use only Yandex and Google you probably don't need to call this
 * function.
 *
 * @param {object} options Object with the following structure (with default
 *                         values): {
 *                             api_name : '',
 *                             api_token: '',
 *                             api_key  : '',
 *                             timeout  : 3000,
 *                             data_open: true
 *                         }
 */
const init = options => {
    API_NAME  = options.api_name  || API_NAME;
    API_TOKEN = options.api_token || API_TOKEN;
    API_KEY   = options.api_key   || API_KEY;

    if (!options.data_open) {
        DATA_OPEN = options.data_open;
    }

    CONNECTION_TIMEOUT = options.timeout || CONNECTION_TIMEOUT;
};


/**
 * Perform request to Service.
 *
 * @param {object} options Node.js HTTPS request options.
 * @param {*} request_body Request body for POST requests. Can be String or
 *                         Buffer. If you do not need it you can pass null or
 *                         empty string ''.
 * @param {*} response_encoding Can be 'utf8' or 'hex'.
 * @param {*} response_parser Callback function(response) where `response` is
 *                            String with raw data from server. Callback
 *                            function should return parsed answer.
 */
const request = (options, request_body = null, response_encoding = 'utf8', response_parser = null) => {
    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            res.setEncoding(response_encoding);

            // pick data
            let buf = '';
            res.on('data', chunk => buf += chunk);

            // all data came
            res.on('end', () => {
                let answer = buf;
                if (response_parser) {
                    try {
                        answer = response_parser(buf);
                    } catch(err) {
                        return reject(err);
                    }
                }

                if (answer !== null) {
                    return resolve(answer);
                } else {
                    return reject(new Error(E_NOTFOUND));
                }
            });
        });

        req.on('socket', socket => {
            socket.setTimeout(CONNECTION_TIMEOUT, () => req.abort());
        });

        req.on('error', err => reject(new Error(E_REQERROR)));

        if (options.method === 'POST' && request_body !== null && request_body !== '') {
            req.write(request_body);
        }

        req.end();
    });
};


/**
 * Get BSSID geographical coordinates from mylnikov.org.
 *
 * @param {String} bssid BSSID of Wi-Fi access point.
 * @return {Promise} Promise resolves with coordinates object in the form of
 *                   {lat: 23.12345, lon: 54.54321, range: 150, ssid: null}.
 */
const requestMylnikov = async bssid => {
    // Example:
    // https://api.mylnikov.org/geolocation/wifi?v=1.1&data=open&bssid=00:00:00:00:00:00
    const options = {
        hostname: 'api.mylnikov.org',
        method  : 'GET',
        path    : `/geolocation/wifi?v=1.1&bssid=${bssid}${DATA_OPEN ? '&data=open' : ''}`
    };

    const request_body      = null;
    const response_encoding = 'utf8';
    const response_parser   = JSON.parse;

    let result = await request(options, request_body, response_encoding, response_parser);

    if (result.result == 200) {
        return {
            lat  : result.data.lat,
            lon  : result.data.lon,
            ssid : null,
            range: Math.round(result.data.range)
        };
    } else {
        return null;
    }
};


/**
 * Get BSSID geographical coordinates from 3wifi.
 *
 * @param {String} bssid BSSID of Wi-Fi access point.
 * @return {Promise} Promise resolves with coordinates object in the form of
 *                   {lat: 23.12345, lon: 54.54321, ssid: 'AP Name', range: null}.
 */
const request3wifi = async bssid => {
    // Example:
    // https://3wifi.stascorp.com/api/apiquery?key=23ZRA8UBSLsdhbdJMp7IpbbsrDFDLuBC&bssid=00:00:00:00:00:00
    const options = {
        hostname: '3wifi.stascorp.com',
        method  : 'GET',
        path    : `/api/apiquery?key=${API_KEY}&bssid=${bssid}`,
        headers: {
            'User-Agent': USER_AGENT
        }
    };

    const request_body      = null;
    const response_encoding = 'utf8';
    const response_parser   = JSON.parse;

    let result = await request(options, request_body, response_encoding, response_parser);

    if (result.result && !Array.isArray(result.data)) {
        return {
            lat  : result.data[bssid.toUpperCase()][0].lat,
            lon  : result.data[bssid.toUpperCase()][0].lon,
            ssid : result.data[bssid.toUpperCase()][0].essid,
            range: null
        };
    } else {
        return null;
    }
};


/**
 * Get BSSID geographical coordinates from wigle.net.
 *
 * @param {String} bssid BSSID of Wi-Fi access point.
 * @return {Promise} Promise resolves with coordinates object in the form of
 *                   {lat: 23.12345, lon: 54.54321, ssid: 'AP Name', range: null}.
 */
const requestWigle = async bssid => {
    // Example:
    // https://api.wigle.net/api/v2/network/search?onlymine=false&first=0&freenet=false&paynet=false&ssid=00:00:00:00:00:00
    const options = {
        hostname: 'api.wigle.net',
        method  : 'GET',
        path    : `/api/v2/network/search?onlymine=false&first=0&freenet=false&paynet=false&netid=${bssid}`,
        auth    : `${API_NAME}:${API_TOKEN}`,
        headers: {
            Accept: 'application/json'
        }
    };

    const request_body      = null;
    const response_encoding = 'utf8';
    const response_parser   = JSON.parse;

    let result = await request(options, request_body, response_encoding, response_parser);

    if (result.success && result.totalResults > 0) {
        return {
            lat  : result.results[0].trilat,
            lon  : result.results[0].trilong,
            ssid : result.results[0].ssid,
            range: null
        };
    } else {
        return null;
    }
};


exports.init = init;

exports.mylnikov = requestMylnikov;
exports['3wifi'] = request3wifi;
exports.wigle    = requestWigle;
