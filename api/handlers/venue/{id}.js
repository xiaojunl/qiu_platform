'use strict';

var Venue = require('../../models/venueModel'),
    Space = require('../../models/spaceModel');

module.exports = {

    get: function (req, res, next) {
        Venue.findOne({_id: req.params.id}, {
            name: 1,
            imgUrls: {$slice: 1},
            props: 1,
            address: 1,
            refundFlg: 1,
            scheduleFlg: 1
        }, (err, v) => {
            if (err) return next(err);
            Space.find({
                _venueId: v._id,
                deleteFlg: 0
            }, 'name', {sort: {_id: 1}}, (err, ss) => {
                if (err) return next(err);
                v._doc.spaces = ss;
                res.json(v);
            });
        });
    }

};
