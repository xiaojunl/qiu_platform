/**
 * Module that will handle our authentication tasks
 * Created by jungle on 14-4-27.
 */

'use strict';

var qiStrategy = require('./passport-qi'),
    utils = require('./utils'),
    error = require('./error'),
    config = require('../config/config'),
    bcrypt = require('bcryptjs');

exports.localStrategy = function () {

    return new qiStrategy(function (username, password, type, done) {
        const User = require('../models/userModel');
        let conQ = {type: type, deleteFlg: 0};
        if (type === 1) {
            conQ.mobile = username;
        } else { // 管理账号
            conQ.username = username;
        }
        User.findOne(conQ, 'password type', function (err, u) {
            if (u && u.passwordMatches(password)) {
                delete u._doc.password;
                return done(null, u);
            } else {
                return done(err, false);
            }
        });
    });

};

exports.isAuthenticated = function (role) {
    return function (req, res, next) {
        const User = require('../models/userModel');
        console.log('req.url:' + req.baseUrl + ',req.method:' + req.method);

        // cookie auth.
        let sequence = req.cookies.sequence;
        if (!req.isAuthenticated() && req.cookies.authToken && bcrypt.compareSync(`${sequence}xxx${req.headers['user-agent']}`, req.cookies.authToken) && sequence.indexOf(',') > -1) {
            let seqs = sequence.split(',');
            let userId = parseInt(seqs[0], 10);
            //let createTime = parseInt(seqs[1], 10);
            User.getLoginUser(userId, (err, u) => {
                req.logIn(u, function (err) {
                    if (err) {
                        next(err);
                    } else {
                        console.log('cookie认证通过:' + userId + ',' + JSON.stringify(req.user));
                        next();
                    }
                });
            });
        } else if (!req.isAuthenticated() && !utils.mapRegexKey(config.openAuth, req.baseUrl, req.method) && req.header('api_key') !== config.api_key) {
            return res.status(401).json(error(40101, 'Unauthorized'));
        } else if (utils.mapRegexKey(config.accessAuth, req.baseUrl, req.method)) {
            if (utils.userAgentType(req.headers['user-agent']) === 'wx') { // weixin
                User.hasMobile(req.user ? req.user._id : -1, (err, flg) => {
                    if (err) return next(err);
                    if (!flg) {
                        // 需要绑定手机号
                        return res.status(401).json(error(40103, '需绑定手机号'));
                    } else {
                        next();
                    }
                });
            } else if (!req.isAuthenticated()) { // mobile&browser
                return res.status(401).json(error(40101, 'Unauthorized'));
            } else {
                next();
            }
        } else {
            next();
        }
    };
};

