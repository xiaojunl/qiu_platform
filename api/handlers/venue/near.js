'use strict';

var Venue = require('../../models/venueModel'),
    utils = require('../../lib/utils'),
    near = require('../../config/config').near,
    isHoliday = require('../../config/config').holiday.todayIsHoliday,
    _ = require("underscore")._;

module.exports = {

    get: function (req, res, next) {

        var q = req.query;
        var earthRadius = utils.earthRadius(true);
        var sortBy = q.sortBy || 0; // {0:智能排序,1:按价格由低到高,2:按距离从近到远}

        var geoQueryCon = {
            deleteFlg: 0,
            'address.city': q.city,
            loc: {$size: 2},
            placeCount: {$gt: 0}
        };
        if (q.area) {
            geoQueryCon['address.area'] = q.area;
        }

        Venue.geoNear(q.loc, {
            spherical: true,
            distanceMultiplier: earthRadius,
            num: near.num,
            maxDistance: near.maxDistance / earthRadius,
            query: geoQueryCon
        }, function (err, vs) {

            if (vs.length > 0 && sortBy < 2) {
                vs = _.sortBy(vs, function (v) {
                    return sortBy ? (isHoliday ? v.obj.weekPriceMin : v.obj.priceMin) : v.dis * 0.6 + (v.obj.envAvg + v.obj.serveAvg) * 0.4;
                });
            }

            if (q.vId || q.vId == 0) {
                var i = 0;
                for (; i < vs.length; i++) {
                    if (vs[i].obj._id == q.vId) {
                        break;
                    }
                }
                vs = vs.slice(i + 1, i + 1 + near.limit);
            } else {
                vs = vs.slice(0, near.limit);
            }

            res.json({
                data: _.map(vs, function (v) {
                    return {
                        _id: v.obj._id,
                        dis: v.dis.toFixed(3),
                        name: v.obj.name,
                        imgUrl: v.obj.imgUrls[0],
                        priceMin: isHoliday ? v.obj.weekPriceMin : v.obj.priceMin,
                        scheduleFlg: v.obj.scheduleFlg,
                        envAvg: v.obj.envAvg,
                        serveAvg: v.obj.serveAvg,
                        commCount: v.obj.comments.length
                    };
                }), more: vs.length === near.limit
            });
        });
    }

};
