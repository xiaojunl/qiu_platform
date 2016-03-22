'use strict';

const mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema,
    wxPay = require('node-weixin-pay'),
    payConf = require('../lib/config-pay'),
    async = require('async'),
    _ = require('underscore')._,
    User = require('./userModel'),
    Product = require('./productModel'),
    aliPay = require('../lib/alipay');

var orderModel = function () {

    var orderSchema = new Schema({
        _userId: {type: Number, ref: 'User'},
        type: Number,   // 订单类型 1:场馆，2：俱乐部,3:商城
        _venueId: {type: Number, ref: 'Venue'},
        _clubId: {type: Number, ref: 'Club'},
        _actId: {type: Number, ref: 'Activity'},
        date: String, // 预定日期 2015-10-22
        orderTimes: [{_id: Number, name: String, times: {type: [String]}}],  //
        products: [
            {
                _id: {type: Number, ref: 'Product'},
                num: Number,
                price: Number,
                name: String,
                imgUrl: String,
                compProp: {
                    _id: String,
                    props: [
                        {_id: false, prop: String, value: String}
                    ]
                }
            }
        ],
        payment: Number, // 付款方式 1:微信网页支付,2:支付宝,3:微信移动支付
        price: Number, // 金额
        sportBeans: Number, // 运动豆,
        freight: Number,// 运费
        finalPrice: Number, // 最终价格
        refundFlg: {type: Number, default: 1},   // 是否接受退款,{0:不接受，1：接受}
        status: [
            {_id: Number, time: Number, reason: String, op: Number} // _id:{0:未付款，1:已支付,2:商家确认接单/已发货，3：交易成功，4:用户取消订单,5:商家取消订单/拒绝订单，6：超时自动关闭（未付款24小时），7:退款中,8：已退款，9：确认收货，10：申述，11：拒绝申述}
        ],
        address: {
            _id: {type: Number, ref: 'Address'},
            name: String, // 姓名
            mobile: String,
            address: String,
            deliveryTime: Number, // 送货时间 {1:周末,2:工作日,3:不限}
        },
        logistics: {_id: String, name: String, time: Number}, // 物流号
        transactionId: String,  // 流水号
        refundChannel: String,  // 退款渠道 {ORIGINAL—原路退款,BALANCE—退回到余额}
        refundStatus: String,   // 退款状态
        createTime: Number,
        deleteFlg: {type: Number, default: 0},  // 删除flg，1：已删除，0：可用
        _hasComm: {type: Number, default: 0}  // 是否评论过，1:已评论，0：没有
    });

    orderSchema.plugin(autoIncrement.plugin, 'Order');
    orderSchema.plugin(mongoosePaginate);

    orderSchema.statics.getCoachId = function (_id, cb) {
        this.findOne({_id: _id, type: 2}, 'orderTimes', (err, o)=> err ? cb(err) : cb(null, o && o.orderTimes[0]._id));
    };

    orderSchema.statics.refund = function (_id, cb) {
        let _this = this;
        _this.findOne({
            _id: _id,
            $where: `this.status[this.status.length-1]._id!=8 && this.status[this.status.length-1]._id!=7`,
            refundFlg: 1
        }, '_userId sportBeans payment finalPrice transactionId type products', (err, o) => {
            if (err) return cb(err);
            if (o) {
                async.waterfall([cb1=> {
                    // 商城订单 产品库存退回
                    if (o.type === 3) {
                        let prods = o.products; // [{_id num compProp}]
                        async.map(prods, (prod, cb)=> {
                            Product.findOne({_id: prod._id}, 'combProps inventory', (err, p)=> {
                                let combProps = p.combProps;
                                for (var i = 0; i < combProps.length; i++) {
                                    if (combProps[i]._id == prod.compProp._id) {
                                        combProps[i].inventory += prod.num;
                                        p.inventory += prod.num;
                                        break;
                                    }
                                }
                                Product.update({_id: p._id}, {combProps: p.combProps, inventory: p.inventory}, cb);
                            });
                        }, (err, ret)=> {
                            cb1(err, ret);
                        });
                    } else {
                        cb1(null, 1);
                    }
                }, (r, cb2)=> {
                    if (o.finalPrice > 0) {
                        if (o.payment === 2) {
                            aliPay.refund(o.transactionId, o.finalPrice, flg=> {
                                if (flg) {
                                    _this.update({_id: o._id}, {
                                        $push: {
                                            status: {
                                                _id: 7,
                                                time: Date.now()
                                            }
                                        }
                                    }, cb2);
                                } else {
                                    cb2(null);
                                }
                            });
                        } else {
                            let finalPrice = (o.finalPrice * 100).toFixed(0),
                                wxConfig = o.payment === 1 ? payConf.getConf4Wechat() : payConf.getConf4App();
                            wxPay.api.refund.create(wxConfig, {
                                out_trade_no: `${o._id}`,
                                out_refund_no: `orn${o._id}`,
                                total_fee: finalPrice,
                                refund_fee: finalPrice,
                                op_user_id: wxConfig.merchant.id
                            }, (err, data) => {
                                if (err) return cb2(data);
                                _this.update({_id: o._id}, {
                                    $push: {
                                        status: {
                                            _id: _.isEmpty(data.refund_channel) ? 8 : 7,
                                            time: Date.now()
                                        }
                                    },
                                    refundChannel: _.isEmpty(data.refund_channel) ? 'now' : data.refund_channel
                                }, function (err) {
                                    cb2(err);
                                    console.log('refund:' + JSON.stringify(data));
                                });
                            });
                        }
                    } else {
                        _this.update({_id: o._id}, {
                            $push: {
                                status: {
                                    _id: 8,
                                    time: Date.now()
                                }
                            }
                        }, cb2);
                    }
                }], (err, ret)=> {
                    console.log('refund ret:' + JSON.stringify(ret));
                    if (o.sportBeans) {
                        User.reBack(o._userId, o.sportBeans, o.payment, o._id, err=>cb(err, false));
                    } else {
                        cb(err, false);
                    }
                });
            } else {
                cb(null, true);
            }
        });
    };

    return mongoose.model('Order', orderSchema);
};

module.exports = new orderModel();
