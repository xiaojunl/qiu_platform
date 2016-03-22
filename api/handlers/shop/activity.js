/**
 * Created by jungle on 15-10-18.
 */
'use strict';

const Activity = require('../../models/activityModel'),
    near = require('../../config/config').near,
    m = require('moment'),
    _ = require('underscore')._;

module.exports = {
    get(req, res, next) {
        const aId = req.query.aId;
        let limit = near.maxLimit;
        if (!aId && aId != 0) {
            limit = near.limit;
        }
        let nowDate = m().format('YYYY-MM-DD');
        Activity.aggregate({$match: {beginDate: {$lte: nowDate}}}, {
            $project: {
                name: 1,
                imgUrl: 1,
                basePrice: 1,
                isEnded: {$gt: [nowDate, '$endDate']},
                endDate: 1
            }
        }, {$sort: {isEnded: 1, createTime: -1}}, {$skip: 0}, {$limit: limit}, (err, as)=> {
            if (err) return next(err);
            if (aId || aId == 0) {
                let i = 0;
                for (; i < as.length; i++) {
                    if (as[i]._id == aId) {
                        break;
                    }
                }
                as = as.slice(i + 1, i + 1 + near.limit);
            }
            _.each(as, a=> {
                a._status = a.isEnded ? 2 : 1;
                a._duration = durationSecs(`${a.endDate} 23:59:59`);
                delete a.isEnded;
                delete a.endDate;
            });
            res.json({data: as, more: as.length === near.limit});
        });
    }
};

// dateTime format:2015-10-18 18:00:00
function durationSecs(dateTime) {
    var startDate = new Date();
    var endDate = new Date(dateTime);
    var df = (endDate.getTime() - startDate.getTime()) / 1000;
    return Math.floor(df);
}