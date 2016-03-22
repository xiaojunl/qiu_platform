'use strict';

var Order = require('../../models/orderModel'),
    Arrange = require('../../models/arrangeModel'),
    _ = require('underscore')._,
    m = require('moment'),
    async = require('async');

module.exports = {

    get(req, res, next) {
        Arrange.find({_userId: req.user._id, status: {$gt: 0}}, '_orderId arrTime._id', (err, as)=> {
            if (err) return next(err);
            Order.find({
                _userId: req.user._id,
                type: 1,
                $where: `this.status[this.status.length-1]._id==2`,
                deleteFlg: 0
            }, 'type _venueId _clubId date orderTimes').populate('_venueId _clubId', {
                _id: 0,
                name: 1,
                address: 1,
                imgUrls: {$slice: 1}
            }).exec((err, os)=> {
                if (err) return next(err);
                let curDate = m().add(5, 'm'), _date = curDate.format('YYYY-MM-DD'), _time = curDate.format('HH:mm');
                async.map(os, (o, cb)=> {
                    if (o.date === _date) {
                        let orderTimes = [], ids = _.pluck(_.pluck(_.where(as, {_orderId: o._id}), 'arrTime'), '_id');
                        _.each(o.orderTimes, ot=> {
                            ot._doc.times = _.reject(ot.times, time=>time < _time);
                            if (!_.isEmpty(ot.times) && !_.contains(ids, ot._id)) {
                                orderTimes.push(ot);
                            }
                        });
                        if (!_.isEmpty(orderTimes)) {
                            o._doc.orderTimes = orderTimes;
                            cb(null, o);
                        } else {
                            cb(null, null);
                        }
                    } else {
                        cb(null, o);
                    }
                }, (err, ret)=> err ? next(err) : res.json(_.compact(ret)));
            });
        });
    }

};
