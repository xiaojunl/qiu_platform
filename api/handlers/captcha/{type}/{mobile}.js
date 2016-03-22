'use strict';

var Captcha = require('../../../models/captchaModel'),
    error = require('../../../lib/error'),
    sms = require('../../../lib/smsApi');

module.exports = {

    get(req, res, next) {
        sms.captcha(req.params.type, req.params.mobile, function (chunk, captcha, ageingTime) {
            if (chunk.error === 0) {
                var capt = new Captcha({
                    type: req.params.type,
                    mobile: req.params.mobile,
                    captcha: captcha,
                    ageingTime: ageingTime,
                    expiredTime: (Date.now() + ageingTime)
                });
                capt.save(function (err) {
                    if (err) return next(err);
                    res.send();
                });
            } else {
                console.error('smsAPI#code:' + chunk.error + ',msg:' + chunk.msg);
                if (chunk.error === -40) {
                    res.status(400).json(error(40001, '错误的手机号码'));
                } else {
                    res.status(503).json(error(50301, '短信通道不可用，请稍后重试'));
                }

            }
        });
    }

};
