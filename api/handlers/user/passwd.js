'use strict';

var User = require('../../models/userModel'),
    Captcha = require('../../models/captchaModel'),
    error = require('../../lib/error'),
    bcrypt = require('bcryptjs');

module.exports = {

    put(req, res, next) {

        Captcha.check(req.body.mobile, req.body.captcha, 'up', function (err, flg) {
            if (flg === 1) {
                User.update({
                    mobile: req.body.mobile,
                    type: 1,
                    deleteFlg: 0
                }, {password: bcrypt.hashSync(req.body.password, 8)}, err=>err ? next(err) : res.send());
            } else if (flg === 2) {
                res.status(400).json(error(40001, '无效手机号'));
            } else if (flg === 3) {
                res.status(400).json(error(40003, '验证码过期'));
            } else if (flg === 4) {
                res.status(400).json(error(40004, '验证码错误'));
            }
        });
    }
};
