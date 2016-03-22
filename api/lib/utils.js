'use strict';

var util = require("util"),
    crypto = require('crypto'),
    http = require('http');

(function (module) {

    var holidays = new Map();

    module.lookup = function (obj, field) {
        if (!obj) {
            return null;
        }
        var chain = field.split(']').join('').split('[');
        for (var i = 0, len = chain.length; i < len; i++) {
            var prop = obj[chain[i]];
            if (typeof(prop) === 'undefined') {
                return null;
            }
            if (typeof(prop) !== 'object') {
                return prop;
            }
            obj = prop;
        }
        return null;
    };

    module.genFileName = function (type, confusion) {
        return confusion + 'qi' + Date.now() + Math.round(Math.random() * 100) + '.' + this.filetype(type);
    };

    module.filetype = function (type) {
        var extensionName = '';
        switch (type) {
            case 'image/pjpeg':
                extensionName = 'jpg';
                break;
            case 'image/jpeg':
                extensionName = 'jpg';
                break;
            case 'image/gif':
                extensionName = 'gif';
                break;
            case 'image/png':
                extensionName = 'png';
                break;
            case 'image/x-png':
                extensionName = 'png';
                break;
            case 'image/bmp':
                extensionName = 'bmp';
                break;
        }
        return extensionName;
    };

    var EARTH_RADIUS = 6371000;    //单位M 6371000 6378137.0
    var PI = Math.PI;

    function getRad(d) {
        return (d * PI) / 180.0;
    }

    module.earthRadius = function (isKm) {
        if (isKm) {
            return EARTH_RADIUS / 1000;
        } else {
            return EARTH_RADIUS;
        }
    };

    /**
     * approx distance between two points on earth ellipsoid
     * @param {Object} lng1
     * @param {Object} lat1
     * @param {Object} lng2
     * @param {Object} lat2
     */
    module.flatternDistance = function (lng1, lat1, lng2, lat2, isKm) {
        var f = getRad((lat1 + lat2) / 2);
        var g = getRad((lat1 - lat2) / 2);
        var l = getRad((lng1 - lng2) / 2);

        if (g === 0 && l === 0) {
            return 0;
        }

        var sg = Math.sin(g);
        var sl = Math.sin(l);
        var sf = Math.sin(f);

        var s, c, w, r, d, h1, h2;
        var a = EARTH_RADIUS;
        var fl = 1 / 298.257;

        sg = sg * sg;
        sl = sl * sl;
        sf = sf * sf;

        s = sg * (1 - sl) + (1 - sf) * sl;
        c = (1 - sg) * (1 - sl) + sf * sl;

        w = Math.atan(Math.sqrt(s / c));
        r = Math.sqrt(s * c) / w;
        d = 2 * w * a;
        h1 = (3 * r - 1) / 2 / c;
        h2 = (3 * r + 1) / 2 / s;

        var dis = d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
        if (isKm) {
            dis = dis / 1000;
        }
        return dis;
    };

//  是否是移动端访问
    module.isMobile = function (userAgent) {
        if (userAgent && (userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('Android') > -1 || userAgent.indexOf('iPad') > -1)) {
            return true;
        } else {
            return false;
        }
    };

    // server-0 user-aget:Mozilla/5.0 (iPhone; CPU iPhone OS 7_1_1 like Mac OS X) AppleWebKit/537.51.2 (KHTML, like Gecko)
    // Mobile/11D201 MicroMessenger/6.2.7 NetType/3G+ Language/zh_CN
//user-aget:Mozilla/5.0 (Linux; U; Android 4.4.4; zh-cn; MI 3 Build/KTU84P) AppleWebKit/533.1 (KHTML, like Gecko)Version/4.0
// MQQBrowser/5.4 TBS/025469 Mobile Safari/533.1 MicroMessenger/6.2.5.51_rfe7d7c5.621 NetType/WIFI Language/zh_CN
    module.userAgentType = function (userAgent) {
        var type;
        var ua = userAgent.toLowerCase();
        if (/micromessenger/.test(ua)) {
            type = 'wx'
        } else if (ua.indexOf('iphone') > -1 || (ua.indexOf('ipad') > -1)) {
            type = 'i';
        } else if (ua.indexOf('android') > -1) {
            type = 'a';
        } else {
            type = 'b'; // browers.
        }
        return type;
    };

    var char = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 2, 3, 4, 5, 6, 7, 8, 9];

    module.create = function (size) {
        var captcha = [];
        for (var i = 0; i < size; i++) {
            captcha.push(char[Math.round(Math.random() * 31)]);
        }
        return captcha;
    };

    module.mapRegexKey = function (map, val, method) {
        let regex = false, m;
        for (let key in map) {
            if (key.indexOf('~') > -1) {
                let keys = key.split('~');
                key = keys[0];
                m = keys[1];
            } else {
                m = undefined;
            }
            if (new RegExp('^' + key + '$').test(val) && (m ? m === method.toLowerCase() : true)) {
                if (map[key] == false) {
                    regex = true;
                }
                break;
            }
        }
        return regex;
    };

/// Parse the given cookie header string into an object
/// The object has the various cookies as keys(names) => values
/// @param {String} str
/// @return {Object}
    module.parseCookie = function (str, opt) {
        opt = opt || {};
        var obj = {};
        var pairs = str.split(/; */);
        var dec = opt.decode || decodeURIComponent;

        pairs.forEach(function (pair) {
            var eq_idx = pair.indexOf('=');

            // skip things that don't look like key=value
            if (eq_idx < 0) {
                return;
            }

            var key = pair.substr(0, eq_idx).trim();
            var val = pair.substr(++eq_idx, pair.length).trim();

            // quoted values
            if ('"' == val[0]) {
                val = val.slice(1, -1);
            }

            // only assign once
            if (undefined == obj[key]) {
                try {
                    obj[key] = dec(val);
                } catch (e) {
                    obj[key] = val;
                }
            }
        });

        return obj;
    };

// 按limit长度缩略字符串，如：str=‘王麻子卡好啦’,limit=4,返回：'王麻子...'
    module.shortStr = function (str, limit) {
        var sstr = str;
        if (str && str.length > limit) {
            sstr = str.substring(0, limit - 1) + '...';
        }
        return sstr;
    };


    module.shortByte = function (str, limit, repStr) {
        repStr = repStr || '...';
        if (module.byteCount(str) > limit) {
            str = module.substr_utf8_bytes(str, 0, limit - module.byteCount(repStr)) + repStr;
        }
        return str;
    };

// 计算字符串字节数
    module.byteCount = function (s) {
        return encodeURI(s).split(/%..|./).length - 1;
    };

    /*
     * 按limit限制的byte长度截取
     * this function scans a multibyte string and returns a substring.
     * arguments are start position and length, both defined in bytes.
     *
     * this is tricky, because javascript only allows character level
     * and not byte level access on strings. Also, all strings are stored
     * in utf-16 internally - so we need to convert characters to utf-8
     * to detect their length in utf-8 encoding.
     *
     * the startInBytes and lengthInBytes parameters are based on byte
     * positions in a utf-8 encoded string.
     * in utf-8, for example:
     *       "a" is 1 byte,
     "ü" is 2 byte,
     and  "你" is 3 byte.
     *
     * NOTE:
     * according to ECMAScript 262 all strings are stored as a sequence
     * of 16-bit characters. so we need a encode_utf8() function to safely
     * detect the length our character would have in a utf8 representation.
     *
     * http://www.ecma-international.org/publications/files/ecma-st/ECMA-262.pdf
     * see "4.3.16 String Value":
     * > Although each value usually represents a single 16-bit unit of
     * > UTF-16 text, the language does not place any restrictions or
     * > requirements on the values except that they be 16-bit unsigned
     * > integers.
     */
    module.substr_utf8_bytes = function (str, startInBytes, lengthInBytes) {

        var resultStr = '';
        var startInChars = 0;
        var ch;

        // scan string forward to find index of first character
        // (convert start position in byte to start position in characters)

        for (var bytePos = 0; bytePos < startInBytes; startInChars++) {

            // get numeric code of character (is >128 for multibyte character)
            // and increase "bytePos" for each byte of the character sequence

            ch = str.charCodeAt(startInChars);
            //bytePos += (ch < 128) ? 1 : unescape(encodeURIComponent(str[startInChars])).length; TODO
        }

        // now that we have the position of the starting character,
        // we can built the resulting substring

        // as we don't know the end position in chars yet, we start with a mix of
        // chars and bytes. we decrease "end" by the byte count of each selected
        // character to end up in the right position
        var end = startInChars + lengthInBytes - 1;

        for (var n = startInChars; startInChars <= end; n++) {
            // get numeric code of character (is >128 for multibyte character)
            // and decrease "end" for each byte of the character sequence
            ch = str.charCodeAt(n);
            //end -= (ch < 128) ? 1 : unescape(encodeURIComponent(str[n])).length; TODO

            resultStr += str[n];
        }

        return resultStr;
    };

    module.isInteger = function (n) {
        return ((typeof n === 'number') && (n % 1 === 0));
    };

    module.isFloat = function (n) {
        return ((typeof n === 'number') && (n % 1 !== 0));
    };

    module.isNumber = function (n) {
        return (typeof n === 'number');
    };

    module.hmsToSecondsOnly = function (str) {
        var p = str.split(':'),
            s = 0, m = 1;

        while (p.length > 0) {
            s += m * parseInt(p.pop(), 10);
            m *= 60;
        }

        return s;
    };

    module.startsWith = function (str, starts, position) {
        str = str.toString();
        starts = '' + starts;
        position = position == null ? 0 : Math.min(position < 0 ? 0 : (+position || 0), str.length);
        return str.lastIndexOf(starts) == position;
    };

    /*
     *return value already encoded with base64
     * */
    module.hmacSha1 = function (encodedFlags, secretKey) {
        var hmac = crypto.createHmac('sha1', secretKey);
        hmac.update(encodedFlags);
        return hmac.digest('base64');
    };

    module.urlsafeBase64Encode = function (val) {
        var encoded = new Buffer(val).toString('base64');
        return encoded.replace(/\//g, '-').replace(/\+/g, '*').replace(/=/g, '.');
    };

    module.reqFullUrl = function (req) {
        return util.format('%s://%s%s', req.protocol, req.headers.host, req.originalUrl)
    };

    module.isHoliday = function (dateTimeStamp, cb) {
        if (holidays.get(dateTimeStamp) !== undefined) {
            cb(holidays.get(dateTimeStamp));
        } else {
            var holiday = require('../config/config').holiday;
            http.get({
                hostname: holiday.hostname,
                path: util.format(holiday.path, dateTimeStamp),
                headers: {apikey: holiday.apiKey}
            }, function (res) {
                res.on('data', function (chunk) {
                    console.log('executeHoliday:' + chunk);
                    holidays.set(dateTimeStamp, chunk == 1 || chunk == 2);
                    cb(holidays.get(dateTimeStamp));
                });
            });
        }
    };

    // beginTime like:09:00(9点)
    module.durationHours = function (beginTime, endTime) {
        return parseInt(endTime.split(':')[0]) - parseInt(beginTime.split(':')[0]);
    };

}(exports));
