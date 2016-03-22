/**
 * Created by jungle on 15-10-20.
 */
'use strict';

let aliPay = require('../../lib/alipay'),
    utils = require('../../lib/utils'),
    iPush = require('../../lib/push-qi'),
    User = require('../../models/userModel'),
    Order = require('../../models/orderModel'),
    SportBeans = require('../../models/sportBeansModel');
;

module.exports = {
    post(req, res, next) {
        let body = req.body;
        console.log('aliPay notify:' + JSON.stringify(body));
        aliPay.verify(body, flg=> {
                if (flg) {
                    if (body['notify_type'] === 'trade_status_sync' && (body['trade_status'] === 'TRADE_SUCCESS' || body['trade_status'] === 'TRADE_FINISHED')) {
                        if (utils.startsWith(body['out_trade_no'], 'sb_')) { // 充值
                            let sId = parseInt(body['out_trade_no'].substring(3));
                            SportBeans.update({_id: sId}, {
                                $push: {
                                    status: {
                                        _id: 1,
                                        time: Date.now()
                                    }
                                }
                            }, err=> {
                                if (err) {
                                    console.error(err);
                                    next(err);
                                } else {
                                    SportBeans.getBeans(sId, (err, u)=> {
                                        User.update({_id: u._userId}, {$inc: {sportBeans: u.beans}}, err=>err ? next(err) : res.send('success'));
                                    });
                                }
                            })
                        } else {  // 订单
                            // 状态-订单处理
                            Order.update({_id: body['out_trade_no']}, {
                                $push: {
                                    status: {
                                        _id: 1,
                                        time: Date.now()
                                    }
                                }, transactionId: body['trade_no']
                            }, err=> {
                                if (err) return next(err);
                                Order.findOne({_id: body['out_trade_no']}, '_userId sportBeans payment', (err, o)=> {
                                    if (o && o.sportBeans) {
                                        User.deduction(o._userId, o.sportBeans, o.payment, o._id, err=>err ? next(err) : res.send('success'));
                                    } else {
                                        res.send('success');
                                    }
                                });
                            });
                        }
                    } else if (body['notify_type'] === 'batch_refund_notify') {
                        let num = body['success_num'], resultDetails = body['result_details'].split('^');
                        if (num > 0 && resultDetails.length > 0 && resultDetails[resultDetails.length - 1] === 'SUCCESS') {
                            Order.findOne({transactionId: resultDetails[0]}, 'sportBeans payment _userId type').populate('_userId', 'iPush').exec((err, o)=> {
                                Order.update({_id: o._id}, {
                                    $push: {
                                        status: {
                                            _id: 8,
                                            time: Date.now()
                                        }
                                    },
                                    refundStatus: body['result_details']
                                }, err=> {
                                    if (err) return next(err);
                                    let u = o._userId;
                                    iPush.pushMsg(o.type < 3 ? 1 : 3, `您的订单${o._id}，已退款`, o._id, u.iPush.clientId, u.iPush.ua, (err, r)=> {
                                        if (err) console.error('notify alipay push:' + err);
                                    });
                                    res.send('success');
                                });
                            });
                        } else {
                            console.error('aliPay batch_refund_notify invalid:' + JSON.stringify(body));
                            res.send('success');
                        }
                    } else {
                        res.send('success');
                    }
                } else {
                    console.error('notify/alipay:' + JSON.stringify(body));
                    res.send('failure');
                }
            }
        );
    }
};