'use strict';

var User = require('../../models/userModel'),
    error = require('../../lib/error'),
    utils = require('../../lib/utils'),
    passport = require('passport'),
    bcrypt = require('bcryptjs');

/**
 * Operations on /login
 */
module.exports = {

    post: function (req, res, next) {
        passport.authenticate('qi', function (err, user) {
            if (err) return next(err);
            if (!user) {
                return res.status(401).send(error(40102, '无效的用户名或密码'));
            }
            req.logIn(user, function (err) {
                if (err) return next(err);
                if (user.type === 1 && utils.userAgentType(req.headers['user-agent']) !== 'wx') {
                    // store data in cookie.
                    let sequence = `${user._id},${Date.now()}`;
                    let hashedCode = bcrypt.hashSync(`${sequence}xxx${req.headers['user-agent']}`, 8);
                    let maxAge = 30 * 24 * 60 * 60 * 1000;
                    res.cookie('authToken', hashedCode, {maxAge});
                    res.cookie('sequence', sequence, {maxAge});
                }
                return res.json(user);
            });
        })(req, res, next);
    }

};
