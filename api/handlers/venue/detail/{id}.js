'use strict';

var Venue = require('../../../models/venueModel');

module.exports = {

    get: function (req, res, next) {
        Venue.findOne({_id: req.params.id}, 'name imgUrls envAvg serveAvg scheduleFlg refundFlg lightChargeFlg props address beginTime endTime weekBeginTime weekEndTime trafficRoute introduce comments mobile')
            .populate('comments._userId', 'nick imgUrl').exec(function (err, v) {
            if (err) return next(err);
            res.json(v);
        });
    }

};
