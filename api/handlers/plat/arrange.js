/**
 * 约战
 */
'use strict';

const Arrange = require('../../models/arrangeModel'),
    paginate = require('../../lib/paginate'),
    _ = require('underscore')._,
    m = require('moment');

module.exports = {

    get(req, res, next){
        let q = req.query, con = {};

        if (q.beginTime) {
            con['arrTime.date'] = {$gte: q.beginTime};
        }
        if (q.endTime) {
            con['arrTime.date'] = con['arrTime.date'] ? _.extend(con['arrTime.date'], {$lte: q.endTime}) : {$lte: q.endTime};
        }

        if (q.status || q.status === 0) {
            con.status = q.status;
        }

        Arrange.paginate(con, {
            columns: '_userId arrName _orderId address createTime arrTime num money status',
            populate: {
                path: '_userId', select: '-_id nick mobile'
            },
            page: q.page,
            limit: q.limit,
            sortBy: {_id: -1},
            lean: true
        }, function (err, results, pageCount, itemCount) {
            if (err) return next(err);
            res.json(paginate(results, pageCount, itemCount));
        });
    }

};