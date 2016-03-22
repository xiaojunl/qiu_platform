'use strict';

var User = require('../../models/userModel');

module.exports = {

    put: function (req, res, next) {
        User.update({_id: req.user._id}, {location: req.body}, function (err) {
            if (err) return next(err);
            res.sendStatus(200);
        });
    }
};
