'use strict';

var User = require('../../models/userModel'),
    Captcha = require('../../models/captchaModel'),
    error = require('../../lib/error');

module.exports = {

    post(req, res, next) {

        Captcha.check(req.body.mobile, req.body.captcha, 'ur', function (err, flg) {
            if (flg === 1) {
                User.findOne({type: 1, mobile: req.body.mobile, deleteFlg: 0}, '_id', function (err, u) {
                    if (err) return next(err);
                    if (u) return res.status(406).send('手机号已注册');
                    var user = new User(req.body);
                    user.type = 1;
                    user.createTime = Date.now();
                    let mobile = `${user.mobile}`;
                    user.nick = `${mobile.substring(0, 3)}****${mobile.substring(7)}`;
                    user.save(err=> err ? next(err) : res.send());
                });
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
