'use strict';

var SportBeans = require('../../../models/sportBeansModel'),
    weixin = require('../../../config/config').weixin,
    confPay = require('../../../lib/config-pay'),
    error = require('../../../lib/error'),
    payConf = require('../../../lib/config-pay'),
    wxPay = require('node-weixin-pay');

module.exports = {

    put(req, res, next) {
        let finalPrice = req.body.price;
        let sportBeans = new SportBeans(req.body);
        sportBeans.beans = parseInt(finalPrice);
        sportBeans._userId = req.user._id;
        sportBeans.status = [{_id: 0, time: (sportBeans.createTime = Date.now())}];
        sportBeans.save(err=> {
            if (err) return next(err);
            if (sportBeans.payment === 2) {
                res.json({payment: req.body.payment, data: {prepayId: `sb_${sportBeans._id}`}});
            } else if (sportBeans.payment === 3) {
                let wxConfig = payConf.getConf4App();
                wxPay.api.order.unified(wxConfig, {
                    spbill_create_ip: weixin.spbillCreateIp,
                    notify_url: weixin.notifyUrl4App,
                    body: '我们已收到付款，您的订单已成功创建',
                    out_trade_no: `sb_${sportBeans._id}`,
                    total_fee: (finalPrice * 100).toFixed(0),
                    trade_type: 'APP'
                }, function (err, data) {
                    if (err) return next(data);
                    var data = {appId: wxConfig.app.id, partnerId: wxConfig.merchant.id, prepayId: data.prepay_id};
                    res.json({payment: req.body.payment, data: data});
                });
            } else {
                res.status(400).json(error(40001, 'payment input Invalid'));
            }
        });
    }

};
