/**
 * Created by jungle on 15-9-11.
 */
'use strict';

var wxPay = require('node-weixin-pay'),
    payConf = require('../../lib/config-pay'),
    xml2js = require('xml2js'),
    Order = require('../../models/orderModel'),
    User = require('../../models/userModel');

module.exports = {

    post(req, res) {
        let wxConfig = payConf.getConf4Wechat();
        wxPay.callback.notify(wxConfig.app, wxConfig.merchant, req, res, (err, data, json, reply) => {
            if (err) {
                console.error(data);
                return res.end(buildXML({xml: {return_code: 'FAIL'}}));
            }
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
                                if (err) console.error(`weixin ${err}`);
                            });
                        }
                    });
                    res.end(buildXML({xml: {return_code: 'SUCCESS'}}));
                }
            });
            console.log('wxPay notify:' + JSON.stringify(data));
        });
    }
};

function buildXML(json) {
    var builder = new xml2js.Builder();
    return builder.buildObject(json);
};