'use strict';

var Club = require('../../../models/clubModel');

module.exports = {

    get: function (req, res, next) {
        Club.findOne({_id: req.params.id}, 'imgUrls scheduleFlg refundFlg flags address beginTime endTime weekBeginTime weekEndTime trafficRoute introduce mobile', function (err, c) {
            if (err) return next(err);
            res.json(c);
        });
    }

};
