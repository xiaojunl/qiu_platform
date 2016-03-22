'use strict';

var Order = require('../../models/orderModel'),
    User = require('../../models/userModel'),
    sms = require('../../lib/smsApi'),
    iPush = require('../../lib/push-qi'),
    utils = require('../../lib/utils'),
    error = require('../../lib/error');

module.exports = {

    put(req, res, next) {
        let logistics = req.body.logistics || null;
        Order.update({
            _id: req.body.id,
            $where: `this.status[this.status.length-1]._id==1`,
            deleteFlg: 0
        }, {
            $push: {status: {_id: req.body.status, time: Date.now(), reason: req.body.reason, op: req.user._id}},
            logistics
        }, (err, d)=> {
            if (err) return next(err);
            if (d.n) {

                if (req.body.status !== 2) {
                    Order.refund(req.body.id, err => err ? next(err) : res.sendStatus(200));
                } else {
                    res.sendStatus(200);
                }
                // 短信通知
                Order.findOne({_id: req.body.id}, '_userId _clubId _venueId type').populate('_userId _clubId _venueId', 'name mobile').exec((err, o)=> {
                    if (o) {

                        let name = o.type === 1 ? o._venueId.name : (o.type === 2 ? o._clubId.name : '我们'), msg;
                        if (req.body.status === 2) {
                            if (o.type < 3) {
                                msg = `${name}已确认您的订单${o._id}`;
                            } else {
                                msg = `您的订单${o._id}，已发货`;
                            }
                        } else {
                            msg = `${name}拒绝了您的订单${o._id}，原因：${req.body.reason}`;
                        }
                        sms.confirmOrder(o._userId.mobile, msg);
                        User.pushInfo(o._userId._id, (err, p)=> {
                            if (err) return console.error(err);
                            if (p && p.ua) {
                                iPush.pushMsg(o.type < 3 ? 1 : 3, msg, o._id, p.clientId, utils.userAgentType(p.ua) === 'i', (err, res)=> {
                                    if (err) console.error(`order/confim-push:${err}`);
                                });
                            }
                        });
                    }
                });
                console.log(`/order/confirm:orderId=${req.body.id},userId=${req.user._id},userType=${req.user.type}`);
            } else {
                res.status(406).send(error(40601, '订单状态已改变'));
            }
        });
    },
    post(req, res, next) { // 用户确认收货
        Order.update({
            _id: req.body.id,
            _userId: req.user._id,
            type: 3,
            $where: `this.status[this.status.length-1]._id==2`,
            deleteFlg: 0
        }, {
            $push: {status: {_id: 9, time: Date.now(), op: req.user._id}}
        }, (err, d)=> {
            if (err) return next(err);
            if (!d.n) res.status(406).send(error(40601, '订单状态已改变'));
            // 站内信
            res.send();
        });
    }

};
