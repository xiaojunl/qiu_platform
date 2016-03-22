'use strict';

var mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment'),
    Schema = mongoose.Schema;

var captchaModel = function () {

    var captchaSchema = new Schema({
        type: String,
        mobile: Number,
        ageingTime: Number,  // 时效
        expiredTime: Number, // 过期时间
        captcha: String
    });

    captchaSchema.plugin(autoIncrement.plugin, 'Captcha');

    captchaSchema.statics.check = function (mobile, captcha, type, cb) {
        this.findOne({
            mobile: mobile,
            type: type
        }, '_id captcha expiredTime', {sort: {_id: -1}}, function (err, usr) {
            var flg = 2; // mobile err
            // captcha: captcha
            if (usr) {
                if (usr.captcha === captcha) {
                    if (usr.expiredTime >= new Date().getTime()) {
                        flg = 1; // success.
                    } else {
                        flg = 3; // expired.
                    }
                } else {
                    flg = 4;  // captcha err.
                }
            }
            cb(err, flg);
        });
    };

    return mongoose.model('Captcha', captchaSchema);
};

module.exports = new captchaModel();
