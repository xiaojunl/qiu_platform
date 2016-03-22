'use strict';

var User = require('../models/userModel'),
    bcrypt = require('bcryptjs');

module.exports = {

    post(req, res, next) {
        if (req.body.type === 4) {
            var user = new User(req.body);
            user.createTime = Date.now();
            user.save(err=> err ? next(err) : res.sendStatus(200));
        } else {
            res.sendStatus(404);
        }
    },

    put(req, res, next) {
        User.update({_id: req.user._id}, {password: bcrypt.hashSync(req.body.password, 8)}, err=> err ? next(err) : res.sendStatus(200));
    },

    get(req, res, next) {
        User.findOne({_id: req.user._id}, 'mobile imgUrl nick sex sportBeans', (err, u)=>err ? next(err) : res.json(u));
    }
};
