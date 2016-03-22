'use strict';
/**
 * Created by jungle on 14-5-20.
 */

var https = require('https');
var querystring = require('querystring');
var luosimao = require('../config/config').luosimao;

(function (module) {

    module.captcha = function (type, mobile, cb) {

        var captcha = getCaptcha();
        var verDesc = '';
        var ageingTime = 1 * 60 * 60 * 1000;

        switch (type) {
            case 'bd':
                verDesc = '微信用户绑定手机号';
                break;
            case 'ur':
                verDesc = '新用户注册';
                break;
            case 'up':
                verDesc = '忘记密码';
                break;
            default :
                return cb({error: -100, msg: '无法识别的验证码发送请求'});
        }

        var postData = {
            mobile: mobile,
            message: '验证码：' + captcha + '(' + verDesc + ')【全网球】'
        };

        reqHandler(postData, function (chunk) {
            cb(JSON.parse(chunk), captcha, ageingTime);
        });
    };

    module.confirmOrder = function (mobile, msg) {

        var postData = {
            mobile: mobile,
            message: `${msg}，请登录查看详情！【全网球】`
        };

        reqHandler(postData, function (chunk) {
            console.log(`confirmOrder:${chunk}`);
        });
    };

    module.msg = function (mobile, msg) {
        var postData = {
            mobile: mobile,
            message: `${msg}【全网球】`
        };

        reqHandler(postData, function (chunk) {
            console.log(`msg:${chunk}`);
        });
    };

}(exports));


function getCaptcha(length) {
    var captcha = "";
    length = length ? length : 5;
    for (var i = 0; i < length; i++) {
        captcha += Math.floor(Math.random() * 10);
    }
    return captcha;
}

// type ∈ (1:sms,2:voice, default 1)
function reqHandler(postData, cb, type) {

    var content = querystring.stringify(postData);

    var options = {
        host: 'sms-api.luosimao.com',
        path: '/v1/send.json',
        method: 'POST',
        auth: 'api:key-' + luosimao.smsKey,
        agent: false,
        rejectUnauthorized: false,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': content.length
        }
    };

    if (type === 2) {
        options.host = 'voice-api.luosimao.com';
        options.path = '/v1/verify.json';
        options.auth = 'api:key-' + luosimao.voiceKey;
    }

    var req = https.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            cb(chunk);
        });
    });

    req.write(content);
    req.end();
}


