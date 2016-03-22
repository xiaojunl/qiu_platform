'use strict';

var weixin = require('../config/config').weixin,
    fs = require('fs');

module.exports = {
    app: { // 公众号
        id: weixin.app.app.id,
        secret: weixin.app.app.secret,
        token: weixin.app.app.token
    },
    merchant: {
        id: weixin.app.merchant.id,
        key: weixin.app.merchant.key,
        pfx: 'a',
        pfxKey: 'pk',
        ssl: {
            cert: fs.readFileSync(weixin.app.certificate.pkcs12),
            key: fs.readFileSync(weixin.app.certificate.key)
        }
    },
    certificate: {
        pkcs12: weixin.app.certificate.pkcs12,
        key: weixin.app.certificate.key
    },
    urls: {
        js: {
            //jssdk 支付页面的URL测试目录， 也是在微信里配置的目录
            main: 'http://localhost/wechat/'
        },
        oauth: {
            //用户首次访问的URL地址
            init: '/wechat',
            //用户通过验证后的返回地址
            redirect: '/wechat',
            //成功获取用户openid后的地址
            success: 'http://pay.domain.com/successAndReadyToPay'
        }
    }
};