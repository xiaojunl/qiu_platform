'use strict';

var Order = require('../../models/orderModel'),
    Arrange = require('../../models/arrangeModel'),
    error = require('../../lib/error'),
    User = require('../../models/userModel'),
    m = require('moment'),
    _ = require('underscore')._;

module.exports = {

    get(req, res, next) {
        Order.findOne({_id: req.params.id, _userId: req.user._id}, {
            type: 1,
            date: 1,
            orderTimes: 1,
            price: 1,
            payment: 1,
            sportBeans: 1,
            _venueId: 1,
            _clubId: 1,
            status: {$slice: -1}
        }).populate('_venueId _clubId', {
            _id: 0,
            name: 1
        }).exec((err, o) => err ? next(err) : res.json(o));
    },
    delete(req, res, next) {
        Order.update({
            _id: req.params.id,
            _userId: req.user._id,
            $where: 'this.status[this.status.length-1]._id==0'
        }, {deleteFlg: 1}, err => err ? next(err) : res.send());
    },
    put(req, res, next) {  // 用户取消订单
        Order.findOne({
            _id: req.params.id,
            _userId: req.user._id,
            $where: `this.status[this.status.length-1]._id<3`,
            deleteFlg: 0
        }, 'orderTimes date status type', (err, o) => {
            if (o && o.type < 3 && allOver1Hours(o.date, o.orderTimes, o.status[o.status.length - 1])) {
                Arrange.findOne({_userId: req.user._id, _orderId: o._id, status: 1}, '_id', (err, a)=> {
                    if (err) return next(err);
                    if (!a) {
                        Order.update({
                            _id: o._id
                        }, {
                            $push: {status: {_id: 4, time: Date.now()}}
                        }, err=> {
                            if (err) return next(err);
                            Order.refund(req.params.id, (err, refundFlg) => {
                                if (err) return next(err);
                                if (refundFlg) return res.status(461).send(error(46101, '不支持退款'));
                                res.send();
                            });
                        });
                    } else {
                        res.status(406).send(error(40601, '订单已加入约战，不能取消或者状态变更'));
                    }
                });
            } else if (o && o.type === 3) {
                Order.update({
                    _id: o._id
                }, {
                    $push: {status: {_id: 4, time: Date.now()}}
                }, err=> {
                    if(err) return next(err);
                    Order.refund(req.params.id, (err, refundFlg) => {
                        if (err) return next(err);
                        if (refundFlg) return res.status(461).send(error(46101, '不支持退款'));
                        res.send();
                    });
                });
            } else {
                res.status(461).send(error(46102, '不支持退单，距离预约开始时间不到1小时或者状态变更'));
            }
        });
    }
};

function allOver1Hours(date, orderTimes, stat) {
    let hoursAfter = m().add(1, 'h'), _date = hoursAfter.format('YYYY-MM-DD'), _time = hoursAfter.format('HH:mm');
    if (date <= _date && stat._id === 2) {
        return _.every(_.flatten(_.pluck(orderTimes, 'times'), true), time=>time > _time);
    } else {
        return true;
    }

}
