'use strict';

var Order = require('../../models/orderModel'),
    User = require('../../models/userModel'),
    error = require('../../lib/error'),
    iPush = require('../../lib/push-qi'),
    sms = require('../../lib/smsApi'),
    utils = require('../../lib/utils');

module.exports = {

    post(req, res, next) {
        Order.update({
            _id: req.body.id,
            type: 3,
            _userId: req.user._id,
            $where: `this.status[this.status.length-1]._id==9`,
            deleteFlg: 0
        }, {
            $push: {status: {_id: 10, time: Date.now(), reason: req.body.reason}}
        }, (err, d)=> {
            if (err) return next(err);
            if (!d.n) return res.status(406).send(error(40601, '订单状态已改变'));
            res.send();
        });
    },
    put(req, res, next) {
        let body = req.body;
        Order.findOne({
            _id: body.id,
            type: 3,
            $where: `this.status[this.status.length-1]._id==10`,
            deleteFlg: 0
        }, '_id _userId', (err, o)=> {
            if (err) return next(err);
            if (!o) return res.status(406).send(error(40601, '订单状态已改变'));
            if (body.accept) { // 退款
                Order.refund(body.id, (err, refundFlg) => {
                    if (err) return next(err);
                    if (refundFlg) return res.status(461).send(error(46101, '不支持退款'));
                    User.pushInfo(o._userId, (err, p)=> {
                        if (err) return console.error(err);
                        if (p) {
                            let msg = `您的申述订单${o._id}，已受理退款，会在1-3个工作日原路退回`;
                            iPush.pushMsg(3, msg, o._id, p.clientId, utils.userAgentType(p.ua) === 'i', (err, r)=> {
                                if (err) console.error(`complain-push:${err}`);
                            });
                        }
                    });
                    res.send();
                });
            } else { // 结束
                Order.update({_id: o._id}, {
                    $pushAll: {
                        status: [{
                            _id: 11,
                            reason: body.reason,
                            time: Date.now()
                        }, {
                            _id: 3,
                            time: Date.now()
                        }]
                    }
                }, err=> {
                    if (err) return next(err);
                    User.findOne({_id: o._userId}, 'mobile', (err, u)=> {
                        if (u && u.mobile) {
                            sms.confirmOrder(u.mobile, `您的申述订单${o._id}，已被拒绝`);
                        }
                        User.pushInfo(o._userId, (err, p)=> {
                            if (p) {
                                let msg = `您的申述订单${o._id}，已完成`;
                                iPush.pushMsg(3, msg, o._id, p.clientId, utils.userAgentType(p.ua) === 'i', (err, r)=> {
                                    if (err) console.error(`complain-push:${err}`);
                                });
                            }
                        });
                    });
                    res.send();
                });

            }
        });
    }

};
