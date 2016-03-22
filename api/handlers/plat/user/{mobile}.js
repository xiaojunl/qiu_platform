'use strict';

var User = require('../../../models/userModel'),
    error = require('../../../lib/error');

module.exports = {

    get(req, res, next) {
        User.findOne({type: 1, mobile: req.params.mobile}, 'createTime', (err, u)=> {
            if (err) return next(err);
            if (u) {
                res.json(u);
            } else {
                res.status(404).json(error(40401, 'user not found.'))
            }
        });
    }

};
