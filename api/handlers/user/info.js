'use strict';

var User = require('../../models/userModel'),
    _ = require('underscore')._;

module.exports = {

    put(req, res, next) {
        User.update({_id: req.user._id}, req.body, err=>err ? next(err) : res.send());
    },
    get(req, res, next) {
        User.findOne({_id: req.user._id}, 'nick sex imgUrl mobile signature', (err, u)=>err ? next(err) : res.json(u));
    }
};
