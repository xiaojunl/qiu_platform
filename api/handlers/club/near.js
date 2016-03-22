'use strict';

var Club = require('../../models/clubModel'),
    utils = require('../../lib/utils'),
    near = require('../../config/config').near,
    _ = require("underscore")._;

module.exports = {

    get: function (req, res, next) {

        var q = req.query;
        var earthRadius = utils.earthRadius(true);
        var sortBy = q.sortBy || 2; // {1:按价格由低到高,2:按距离从近到远}

        var geoQueryCon = {
            deleteFlg: 0,
            'address.city': q.city,
            loc: {$size: 2},
            coachCount: {$gt: 0}
        };
        if (q.area) {
            geoQueryCon['address.area'] = q.area;
        }

        Club.geoNear(q.loc, {
            spherical: true,
            distanceMultiplier: earthRadius,
            num: near.num,
            maxDistance: near.maxDistance / earthRadius,
            query: geoQueryCon
        }, function (err, vs) {
            if (err) return next(err);

            if (vs.length > 0 && sortBy == 1) {
                vs = _.sortBy(vs, function (v) {
                    return v.obj.priceMin;
                });
            }

            if (q.cId || q.cId == 0) {
                var i = 0;
                for (; i < vs.length; i++) {
                    if (vs[i].obj._id == q.cId) {
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
                        priceMin: v.obj.priceMin,
                        scheduleFlg: v.obj.scheduleFlg,
                        flags: v.obj.flags
                    };
                }), more: vs.length === near.limit
            });
        });
    }
};
