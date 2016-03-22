/**
 * Created by jungle on 15-9-11.
 */
'use strict';

var wxPay = require('node-weixin-pay'),
    payConf = require('../../lib/config-pay'),
    xml2js = require('xml2js'),
    utils = require('../../lib/utils'),
    User = require('../../models/userModel'),
    Order = require('../../models/orderModel'),
    SportBeans = require('../../models/sportBeansModel');

module.exports = {

    post(req, res, next) {
        let wxConfig = payConf.getConf4App();
        wxPay.callback.notify(wxConfig.app, wxConfig.merchant, req, res, (err, data, json, reply) => {
            if (err) {
                console.error(data);
                return res.end(buildXML({xml: {return_code: 'FAIL'}}));
            }
            if (utils.startsWith(data.out_trade_no, 'sb_')) { // 充值
                let sId = parseInt(data.out_trade_no.substring(3));
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
                        res.end(buildXML({xml: {return_code: 'FAIL'}}));
                    } else {
                        SportBeans.getBeans(sId, (err, u)=> {
                            User.update({_id: u._userId}, {$inc: {sportBeans: u.beans}}, err=>err ? res.end(buildXML({xml: {return_code: 'FAIL'}})) : res.end(buildXML({xml: {return_code: 'SUCCESS'}})));
                        });
                    }
                })
            } else {  // 订单
                Order.update({_id: data.out_trade_no}, {
                    $push: {
                        status: {
                            _id: 1,
                            time: Date.now()
                        }
                    },
                    transactionId: data.transaction_id
                }, err=> {
                    if (err) {
                        console.error(err);
                        res.end(buildXML({xml: {return_code: 'FAIL'}}));
                    } else {
                        Order.findOne({_id: data.out_trade_no}, '_userId sportBeans payment', (err, o)=> {
                            if (o && o.sportBeans) {
                                User.deduction(o._userId, o.sportBeans, o.payment, o._id, err=> {
                                    if (err) console.error(`weixin4app ${err}`);
                                });
                            }
                        });
                        res.end(buildXML({xml: {return_code: 'SUCCESS'}}));
                    }
                });
            }
            console.log('wxPay notify 4app:' + JSON.stringify(data));
        });
    }
};

function buildXML(json) {
    var builder = new xml2js.Builder();
    return builder.buildObject(json);
};