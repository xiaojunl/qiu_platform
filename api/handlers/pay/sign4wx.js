/**
 * Created by jungle on 15-9-11.
 */
'use strict';

var wxPay = require('node-weixin-pay'),
    payConf = require('../../lib/config-pay'),
    weixin = require('../../config/config').weixin,
    Order = require('../../models/orderModel');

module.exports = {

    post: function (req, res, next) {
        let body = req.body;
        let finalPrice = body.price - (body.sportBeans || 0);
        finalPrice = finalPrice < 0 ? 0 : finalPrice;

        let wxConfig = payConf.getConf4Wechat();

        wxPay.api.order.unified(wxConfig, {
            openid: req.user.openId,
            spbill_create_ip: weixin.spbillCreateIp,
            notify_url: weixin.notifyUrl,
            body: '我们已收到付款，您的订单已成功创建',
            out_trade_no: body.orderId,
            total_fee: (finalPrice * 100).toFixed(0),
            trade_type: 'JSAPI'
        }, function (err, data, jsn) {
            if (err) return next(JSON.stringify(jsn));
            var data = wxPay.prepay(data.prepay_id, wxConfig.app, wxConfig.merchant);
            body.payment = 1;
            body.finalPrice = finalPrice;
            Order.update({_id: body.orderId}, body, err=> {
                if (err) return next(err);
                res.json(data);
            });
        });
    },
    put: function (req, res, next) {
        let body = req.body, wxConfig = payConf.getConf4App(), finalPrice = body.price - (body.sportBeans || 0);
        finalPrice = finalPrice < 0 ? 0 : finalPrice;
        body.finalPrice = finalPrice.toFixed(2);
        wxPay.api.order.unified(wxConfig, {
            spbill_create_ip: weixin.spbillCreateIp,
            notify_url: weixin.notifyUrl4App,
            body: '我们已收到付款，您的商城订单已成功创建',
            out_trade_no: body.orderId,
            total_fee: (body.finalPrice * 100).toFixed(0),
            trade_type: 'APP'
        }, function (err, data) {
            if (err) return next(data);
            var data = {
                appId: wxConfig.app.id,
                partnerId: wxConfig.merchant.id,
                prepayId: data.prepay_id
            };
            res.json({payment: 3, orderId: body.orderId, data});
        });
    }

};