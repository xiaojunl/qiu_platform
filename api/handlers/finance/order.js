'use strict';

var Order = require('../../models/orderModel'),
    error = require('../../lib/error'),
    User = require('../../models/userModel'),
    m = require('moment'),
    _ = require('underscore')._;

module.exports = {

    get(req, res, next) {
        let q = req.query;
        let matchCon = {
            deleteFlg: 0,
            "status._id": {$gte: 3}
        }, beginTime = q.beginTime || 1, endTime = q.endTime || Date.now();

        if (req.user.type === 2) {
            matchCon._venueId = req.user._venueId;
        } else if (req.user.type === 3) {
            matchCon._clubId = req.user._clubId;
        }
        // FIXME finace order#type=3
        if (q.type) {
            matchCon.type = q.type;
        }

        Order.aggregate({
                $match: matchCon
            }, {$unwind: "$status"}, {
                $match: {
                    "status._id": {$in: [1, 2, 3, 4, 5]}
                }
            }, {
                $group: {
                    _id: {
                        time: {$subtract: ["$status.time", {$mod: ["$status.time", 1000 * 60 * 60 * 24]}]},
                        statusId: "$status._id"
                    }, count: {$sum: 1}, price: {$sum: "$price"}
                }
            }, {
                $match: {
                    "_id.time": {$gte: beginTime, $lte: endTime}
                }
            }
            , {
                $group: {
                    _id: "$_id.time",
                    types: {$addToSet: {typeId: "$_id.statusId", count: "$count", price: "$price"}}
                }
            }, {$sort: {_id: -1}}, function (err, d) {
                if (err) return next(err);
                res.json(d);
            });
    }
};
