'use strict';

var User = require('../../../models/userModel');

module.exports = {

    get: function (req, res, next) {
        User.findOne({type: 1, mobile: req.params.mobile, deleteFlg: 0}, '_id', function (err, u) {
            if (err) return next(err);
            res.json({isExists: u != null});
        });
    }

};
