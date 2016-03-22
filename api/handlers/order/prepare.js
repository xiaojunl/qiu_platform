'use strict';

var Order = require('../../models/orderModel'),
    User = require('../../models/userModel'),
    Product = require('../../models/productModel'),
    Activity = require('../../models/activityModel'),
    Address = require('../../models/addressModel'),
    weixin = require('../../config/config').weixin,
    error = require('../../lib/error'),
    payConf = require('../../lib/config-pay'),
    wxPay = require('node-weixin-pay'),
    _ = require('underscore')._,
    async = require('async'),
    m = require('moment');

module.exports = {

    put(req, res, next) {
        let body = req.body;
        if (!body.sportBeans) body.sportBeans = 0;
        let finalPrice = body.price - body.sportBeans;
        finalPrice = finalPrice < 0 ? 0 : finalPrice;
        body.finalPrice = finalPrice.toFixed(2);
        if (body.finalPrice > 0) {
            if (body.payment === 3) {
                let wxConfig = payConf.getConf4App();
                wxPay.api.order.unified(wxConfig, {
                    spbill_create_ip: weixin.spbillCreateIp,
                    notify_url: weixin.notifyUrl4App,
                    body: '我们已收到付款，您的订单已成功创建',
                    out_trade_no: body.orderId,
                    total_fee: (finalPrice * 100).toFixed(0),
                    trade_type: 'APP'
                }, function (err, data) {
                    if (err) return next(data);
                    var data = {appId: wxConfig.app.id, partnerId: wxConfig.merchant.id, prepayId: data.prepay_id};
                    Order.update({
                        _id: body.orderId,
                        _userId: req.user._id
                    }, body, err=> {
                        if (err) return next(err);
                        res.json({payment: body.payment, data: data});
                    });
                });
            } else if (body.payment === 2) {
                Order.update({
                    _id: body.orderId,
                    _userId: req.user._id
                }, body, err=> {
                    if (err) return next(err);
                    res.json({payment: body.payment});
                });
            } else {
                res.status(400).json(error(40001, 'payment input Invalid'));
            }
        } else {
            Order.update({
                _id: body.orderId,
                _userId: req.user._id
            }, {
                $push: {
                    status: {
                        _id: 1,
                        time: Date.now()
                    }
                },
                payment: body.payment,
                sportBeans: body.sportBeans,
                price: body.price,
                finalPrice: body.finalPrice
            }, err=> {
                if (err) return next(err);
                if (body.sportBeans) {
                    User.deduction(req.user._id, body.sportBeans, body.payment, body.orderId, err=>err ? next(err) : res.json({payment: body.payment}));
                } else {
                    res.json({payment: body.payment});
                }
            });
        }
    },
    post(req, res, next) {  // 商城订单提交
        let body = req.body;
        if (!body.sportBeans) body.sportBeans = 0;
        let finalPrice = body.price - (body.sportBeans || 0) + (body.freight || 0);
        finalPrice = finalPrice < 0 ? 0 : finalPrice;
        body.finalPrice = finalPrice.toFixed(2);

        let ord = new Order(body);
        ord._userId = req.user._id;
        ord.type = 3;
        ord.status = [{_id: ord.finalPrice > 0 ? 0 : 1, time: (ord.createTime = Date.now())}];
        let curDate = m().format('YYYY-MM-DD');
        Activity.findOne({
            _id: ord._actId,
            endDate: {$gte: curDate},
            beginDate: {$lte: curDate}
        }, 'rebate products', (err, a)=> {
            if (err) return next(err);
            if (!a) return res.status(406).json(error(40601, '活动过期'));
            Product.find({_id: {$in: _.pluck(body.products, '_id')}}, {
                name: 1,
                price: 1,
                imgUrls: {$slice: 1},
                combProps: 1
            }, (err, ps) => {
                if (err) return next(err);
                let products = [];
                _.each(body.products, curProd=> {
                    let p = _.findWhere(ps, {_id: curProd._id}), prod = {
                        _id: curProd._id,
                        price: p.price,
                        num: curProd.num,
                        name: p.name,
                        imgUrl: p.imgUrls[0]
                    };
                    if (curProd.propId) {
                        var combProps = p.combProps;
                        for (var i = 0; i < combProps.length; i++) {
                            if (combProps[i]._id == curProd.propId) {
                                combProps[i].inventory -= prod.num;
                                prod.compProp = {
                                    _id: combProps[i]._id,
                                    props: combProps[i].props,
                                    inventory: combProps[i].inventory,
                                    status: combProps[i].status
                                };
                                break;
                            }
                        }
                    }
                    products.push(prod);
                });

                if (!_.every(products, p=> {
                        let cp = p.compProp;
                        return cp && cp.inventory > 0 && cp.status;
                    })) {
                    return res.status(406).json(error(40602, '有产品无库存或库存不足或已下架'));
                } else {
                    async.parallel({
                        prod(cb){
                            // 产品库存增减后的保存。
                            async.map(ps, (p, cb1)=> {
                                let inventory = 0;
                                _.each(p.combProps, cp=> {
                                    if (cp.status) inventory += cp.inventory;
                                });
                                Product.update({_id: p._id}, {combProps: p.combProps, inventory}, cb1)
                            }, cb);
                        }, ord(cb){
                            delete ord._doc.products;
                            ord.products = products;
                            Address.findOne({_id: body._addrId}, '-_userId -createTime', (err, a)=> {
                                if (err) return cb(err);
                                ord.address = a;
                                ord.save(err=> {
                                    if (!ord.finalPrice) {
                                        User.deduction(ord._userId, ord.sportBeans, ord.payment, ord._id, err=>cb(err, null));
                                    } else if (ord.payment === 3) {
                                        let wxConfig = payConf.getConf4App();
                                        wxPay.api.order.unified(wxConfig, {
                                            spbill_create_ip: weixin.spbillCreateIp,
                                            notify_url: weixin.notifyUrl4App,
                                            body: '我们已收到付款，您的订单已成功创建',
                                            out_trade_no: ord._id,
                                            total_fee: (finalPrice * 100).toFixed(0),
                                            trade_type: 'APP'
                                        }, (err, data) => cb(err, data && data.prepay_id ? {
                                            appId: wxConfig.app.id,
                                            partnerId: wxConfig.merchant.id,
                                            prepayId: data.prepay_id
                                        } : data));
                                    } else {
                                        cb(err, null);
                                    }

                                });
                            });
                        }
                    }, (err, ret)=> {
                        if (err) return next(err);
                        let resObj = {payment: ord.payment, orderId: ord._id};
                        if (ret.ord) resObj.data = ret.ord;
                        res.json(resObj);
                    });
                }

            });
        });
    }

};
