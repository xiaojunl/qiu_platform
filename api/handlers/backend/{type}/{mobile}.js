'use strict';

var Captcha = require('../../../models/captchaModel');

module.exports = {

    get(req, res, next) {
        Captcha.findOne({
            type: req.params.type,
            mobile: req.params.mobile
        }, 'expiredTime captcha', {sort: {_id: -1}}, (err, c) => err ? next(err) : res.json(c));
    }

};
