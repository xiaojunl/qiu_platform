'use strict';
/**
 * Created by jungle on 15-4-16.
 */

var async = require("async"),
    _ = require("underscore")._,
    util = require("util"),
    https = require('https'),
    url = require('url'),
    fs = require('fs'),
    crypto = require('crypto'),
    StringDecoder = require('string_decoder').StringDecoder,
    querystring = require('querystring'),
    aliPayConf = require('../config/config').alipay,
    AlipaySubmit = require('./alipay/alipay_submit.class').AlipaySubmit,
    DOMParser = require('xmldom').DOMParser,
    m = require('moment');


let default_alipay_config = {
    key: aliPayConf.key,
    partner: aliPayConf.partner,
    cacert: aliPayConf.cacert, //ca证书路径地址，用于curl中ssl校验 请保证cacert.pem文件在当前文件夹目录中
    transport: 'http',  //访问模式,根据自己的服务器是否支持ssl访问，若支持请选择https；若不支持请选择http
    input_charset: aliPayConf.charset, //字符编码格式 目前支持 gbk 或 utf-8
    sign_type: "MD5"//签名方式 不需修改
};

(function (module) {

    // 校验支付回调签名, 验证消息是否是支付宝发出的合法消息
    module.verify = function (params, callback) {
        async.parallel([function (cb) { // verify response
            if (params.notify_id) {
                var verifyUrl = util.format(aliPayConf.httpsVerifyUrl, aliPayConf.partner, params.notify_id);
                https.get(verifyUrl, function (res) {
                    res.on('data', function (d) {
                        if (d == 'true') {
                            cb(null);
                        } else {
                            cb('10');
                        }
                    });
                }).on('error', function (e) {
                    cb(e);
                });
            } else {
                cb('11');
            }
        }, function (cb) { // verify sign
            var sign = params.sign;
            // FIXME rsa verify invalid.
            if (params.trade_no && params.out_trade_no && params.trade_status && params.sign_type === aliPayConf.signType) {
                cb(null);
            } else {
                cb('12');
            }
            //if (sign) {
            //    // remove paramters:empty value param、sign、sign_type & con with '&'
            //    params = _.omit(params, function (val, key) {
            //        return _.isEmpty(val) || key.toLowerCase() === 'sign' || key.toLowerCase() === 'sign_type';
            //    });
            //    var preSignStr = querystring.stringify(params); // 待签名字符串
            //    if (aliPay.signType === 'RSA') {
            //        var verifier = crypto.createVerify('RSA-SHA1');
            //        verifier.update(new Buffer(preSignStr, aliPay.charset));
            //        var isPassed = verifier.verify(new Buffer(aliPay.publicKey, 'base64').toString(), sign, 'base64');
            //        console.log('aliPay#result ' + isPassed);
            //        cb(true);
            //    } else {
            //        cb(false);
            //    }
            //} else {
            //    cb(false);
            //}
        }], function (err, flg) {
            if (err) console.error(err);
            callback(!err);
        });
    };

    module.refund = function (tradeNo, price, cb) {

        let params = {
            service: 'refund_fastpay_by_platform_nopwd',
            partner: aliPayConf.partner,
            notify_url: aliPayConf.callServerUrl,
            seller_email: aliPayConf.seller,
            refund_date: m().format('YYYY-MM-DD HH:mm:ss'),
            batch_no: genBatchNo(),
            batch_num: '1',
            detail_data: `${tradeNo}^${price}^协商退款`,
            _input_charset: aliPayConf.charset
        };

        let alipaySubmit = new AlipaySubmit(default_alipay_config);
        alipaySubmit.buildRequestHttp(params, d=> {
            let doc = new DOMParser().parseFromString(d);
            let isSuccessItem = doc.getElementsByTagName("is_success");
            if (isSuccessItem.item(0).textContent === 'F') {
                let errorItem = doc.getElementsByTagName("error");
                console.error('alipay#refund:' + errorItem.item(0).textContent);
                cb(false);
            } else {
                cb(true);
            }
        })

    };

    module.testVerifySign = function (params) {
        var sign = params.sign;
        if (sign) {
            // remove paramters:empty value param、sign、sign_type & con with '&'
            params = _.omit(params, function (val, key) {
                return _.isEmpty(val) || key.toLowerCase() === 'sign' || key.toLowerCase() === 'sign_type';
            });
            params = sortObject(params);
            var preSignStr = querystring.stringify(params); // 待签名字符串
            console.log('preSignStr:' + preSignStr);
            if (aliPayConf.signType === 'RSA') {
                var verifier = crypto.createVerify('RSA-SHA1');
                verifier.update(preSignStr);
                var bioPubKey = fs.readFileSync("/srv/conf/rsa_public_key_ali.pem");
                console.log(sign);
                var isPassed = verifier.verify(bioPubKey, sign, 'hex');
                return isPassed;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

}(exports));

function genBatchNo() {
    return `${m().format('YYYYMMDD')}${random()}`;
}

function random() {
    var randStr = "";
    for (var i = 0; i < 4; i++) {
        randStr += Math.floor(Math.random() * 10);
    }
    if (randStr === '0000') {
        return random(4);
    }
    return randStr;
}

function sortObject(object) {
    var sortedObj = {},
        keys = _.keys(object);

    keys = _.sortBy(keys, function (key) {
        return key;
    });

    _.each(keys, function (key) {
        sortedObj[key] = object[key];
    });

    return sortedObj;
}
