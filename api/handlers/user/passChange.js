'use strict';

var User = require('../../models/userModel'),
    Captcha = require('../../models/captchaModel'),
    error = require('../../lib/error'),
    bcrypt = require('bcryptjs');

module.exports = {

    put(req, res, next) {

        User.findOne({
            _id: req.user._id,
            type: 1,
            deleteFlg: 0
        }, 'password', (err, u)=> {
            if (err) return next(err);
            if (u) {
                if (u.passwordMatches(req.body.password)) {
                    User.update({_id: u._id}, {password: bcrypt.hashSync(req.body.newPassword, 8)}, err=>err ? next(err) : res.send());
                } else {
                    res.status(400).json(error(400001, 'invalid password.'))
                }
            } else {
                res.sendStatus(400);
            }
        });
    }
};
