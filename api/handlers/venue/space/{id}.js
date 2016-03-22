'use strict';

var Space = require('../../../models/spaceModel'),
    User = require('../../../models/userModel'),
    error = require('../../../lib/error');

module.exports = {

    get: function (req, res, next) {
        Space.findOne({_id: req.params.id}, 'name price weekPrice deleteFlg', function (err, s) {
            if (err) return next(err);
            res.json(s);
        });
    }

};
