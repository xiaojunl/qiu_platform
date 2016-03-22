'use strict';

var Venue = require('../../../models/venueModel'),
    User = require('../../../models/userModel'),
    error = require('../../../lib/error');

module.exports = {

    delete: function (req, res, next) {
        Venue.findOne({_id: req.params.id, deleteFlg: 1}, '_id', function (err, v) {
            if (err) return next(err);
            if (v) {
                User.findIdByVenueId(v._id, function (err, uId) {
                    if (err) return next(err);
                    User.update({_id: uId}, {deleteFlg: 1}, function (err) {
                        if (err) return next(err);
                        res.sendStatus(200);
                    });
                });
            } else {
                // do noting.
                res.status(400).json(error(40001, 'input Invalid'));
            }
        });
    }

};
