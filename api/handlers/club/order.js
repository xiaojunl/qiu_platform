'use strict';

var Order = require('../../models/orderModel'),
    paginate = require('../../lib/paginate'),
    _ = require("underscore")._;

module.exports = {

    get: function (req, res, next) {

        let q = req.query;
        let qConn = {deleteFlg: 0, type: 2, _clubId: req.user._clubId};
        if (q.beginTime) {
            qConn.date = {$gte: q.beginTime};
        }
        if (q.endTime) {
            qConn.date = qConn.date ? _.extend(qConn.date, {$lte: q.endTime}) : {$lte: q.endTime};
        }
        if (q.oId || q.oId === 0) {
            qConn._id = q.oId;
        }
        if (q.userId) {
            qConn._userId = q.userId;
        }
        if (q.status) {
            if (q.status == 99) { // 交易失败
                qConn['$where'] = `this.status[this.status.length-1]._id > 3 && this.status[this.status.length-1]._id != 7 `;
            } else {
                qConn['$where'] = `this.status[this.status.length-1]._id==${q.status}`;
            }
        }

        Order.paginate(qConn, {
            columns: 'createTime _userId price status date orderTimes',
            populate: {
                path: '_userId', select: 'nick mobile'
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
