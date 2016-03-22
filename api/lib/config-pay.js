/**
 * Created by jungle on 15-9-27.
 */

'use strict';

var weixin = require('../config/config').weixin,
    wxApi = require('node-weixin-api'),
    fs = require('fs'),
    _ = require('underscore')._;

((module) => {
    let weChatConf, appConf;
    module.init = function () {
        weChatConf = weixin.wechat, appConf = weixin.app;

        let app = {
            appId: weChatConf.app.id,
            appSecret: weChatConf.app.secret,
            appToken: weChatConf.app.token
        }, merchant = Object.assign({}, weChatConf.merchant), urls = weChatConf.urls;
        merchant.ssl = {
            cert: fs.readFileSync(weChatConf.certificate.pkcs12),
            key: fs.readFileSync(weChatConf.certificate.keyPath)
        }
        wxApi.init({app, merchant, urls});
    };
    module.getConf4Wechat = function () {
        return weChatConf;
    };
    module.getConf4App = function () {
        return appConf;
    };
})(exports);