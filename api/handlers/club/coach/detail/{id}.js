'use strict';

var Coach = require('../../../../models/coachModel');

module.exports = {

    get: function (req, res, next) {
        Coach.findOne({_id: req.params.id}, 'name imgUrl professAvg communicationAvg price age level introduce comments _clubId')
            .populate('comments._userId _clubId', 'nick imgUrl scheduleFlg refundFlg').exec(function (err, v) {
            if (err) return next(err);
            res.json(v);
        });
    }

};
