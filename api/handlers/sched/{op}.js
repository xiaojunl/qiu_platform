'use strict';

var http = require('http'),
    util = require('util'),
    moment = require('moment'),
    async = require('async'),
    wxPay = require('node-weixin-pay'),
    payConf = require('../../lib/config-pay'),
    qn = require('../../lib/qn-qi'),
    utils = require('../../lib/utils'),
    iPush = require('../../lib/push-qi'),
    holiday = require('../../config/config').holiday,
    isProduction = require('../../config/config').isProduction;

module.exports = {

    get: function (req, res) {
        switch (req.params.op) {
            case 'acceptOrderTime':
                acceptOrderTime();
                break;
            case 'acceptOrderTimeoutTime':
                acceptOrderTimeoutTime();
                break;
            case 'confirmOrderTime':
                confirmOrderTime();
                break;
            case 'refundBalanceTime':
                refundBalanceTime();
                break;
            case 'refundOriginalTime':
                refundOriginalTime();
                break;
            case 'refundTime':
                refundTime();
                break;
            case 'tokenTime':
                tokenTime();
                break;
            case 'holidayTime':
                holidayTime();
                break;
            case 'orderTime':
                orderTime();
                break;
            case 'orderTimeoutTime':
                orderTimeoutTime();
                break;
            case 'orderCloseTime':
                orderCloseTime();
                break;
            case 'orderClose3Time':
                orderClose3Time();
                break;
            case 'arrangeEndTime':
                arrangeEndTime();
                break;
        }
        res.sendStatus(200);
    }

};

function acceptOrderTime() {
    var Order = require('../../models/orderModel'),
        User = require('../../models/userModel');
    Order.find({
        deleteFlg: 0,
        type: {$lt: 3},
        $where: 'this.status[this.status.length-1]._id==1 && this.status[this.status.length-1].time<' + (Date.now() - 30 * 60 * 1000)
    }, '_id _userId _clubId _venueId').populate('_clubId _venueId', 'name').exec((err, os) => {
        if (err) {
            console.error('acceptOrderTime:' + err);
        } else {
            async.map(os, (o, cb) => {
                Order.update({_id: o._id}, {
                    $push: {
                        status: {
                            _id: 2,
                            time: Date.now(),
                            op: -1  // 系统，30分钟超时未处理默认接受
                        }
                    }
                }, err=> {
                    User.pushInfo(o._userId, (err, p)=> {
                        if (err) return console.error(err);
                        if (p) {
                            let name = o.type === 1 ? o._venueId.name : o._clubId.name, msg = `${name}已确认您的订单${o._id}`;
                            iPush.pushMsg(1, msg, o._id, p.clientId, utils.userAgentType(p.ua) === 'i', (err, res)=> {
                                if (err) console.error(`acceptOrderTime-push:${err}`);
                            });
                        }
                    });
                    cb(err, o._id);
                });
            }, (err, oIds)=> {
                if (err) {
                    console.error('acceptOrderTime:' + err);
                } else {
                    console.log('acceptOrderTime exec orderIds:' + oIds + ',at time:' + (new Date()));
                }
            });
        }
    });
}
function acceptOrderTimeoutTime() {
    var Order = require('../../models/orderModel'),
        User = require('../../models/userModel');
    let curDate = moment(), date = curDate.format('YYYY-MM-DD'), time = curDate.format('HH:mm');
    Order.find({
        type: {$lt: 3},
        date,
        deleteFlg: 0,
        'orderTimes.times': {$lte: time},
        $where: 'this.status[this.status.length-1]._id==1'
    }, '_id _userId _clubId _venueId').populate('_clubId _venueId', 'name').exec((err, os) => {
        if (err) {
            console.error('acceptOrderTime:' + err);
        } else {
            async.map(os, (o, cb) => {
                Order.update({_id: o._id}, {
                    $push: {
                        status: {
                            _id: 2,
                            time: Date.now(),
                            op: -2  // 系统，超过预定时间自动接单
                        }
                    }
                }, err=> {
                    User.pushInfo(o._userId, (err, p)=> {
                        if (err) return console.error(err);
                        if (p) {
                            let name = o.type === 1 ? o._venueId.name : o._clubId.name, msg = `${name}已确认您的订单${o._id}`;
                            iPush.pushMsg(1, msg, o._id, p.clientId, utils.userAgentType(p.ua) === 'i', (err, res)=> {
                                if (err) console.error(`acceptOrderTimeoutTime-push:${err}`);
                            });
                        }
                    });
                    cb(err, o._id);
                });
            }, (err, oIds)=> {
                if (err) {
                    console.error('acceptOrderTimeoutTime:' + err);
                } else {
                    console.log('acceptOrderTimeoutTime exec orderIds:' + oIds + ',at time:' + (new Date()));
                }
            });
        }
    });
}
function confirmOrderTime() {
    var Order = require('../../models/orderModel');
    Order.find({
        deleteFlg: 0,
        type: 3,
        $where: `this.status[this.status.length-1]._id==2 && this.status[this.status.length-1].time<${Date.now() - 7 * (isProduction ? 24 * 60 : 1) * 60 * 1000}`
    }, '_id _userId _clubId _venueId').populate('_clubId _venueId', 'name').exec((err, os) => {
        if (err) {
            console.error('confirmOrderTime:' + err);
        } else {
            async.map(os, (o, cb) => {
                Order.update({_id: o._id}, {
                    $push: {
                        status: {
                            _id: 9,
                            time: Date.now(),
                            op: -1  // 系统，超7天未处理默认收货
                        }
                    }
                }, err=> cb(err, o._id));
            }, (err, oIds)=> {
                if (err) {
                    console.error('confirmOrderTime:' + err);
                } else {
                    console.log('confirmOrderTime exec orderIds:' + oIds + ',at time:' + (new Date()));
                }
            });
        }
    });
}
function refundBalanceTime() {
    refundTime('BALANCE');
}
function refundOriginalTime() {
    refundTime('ORIGINAL');
}
function refundTime(refundChannel) {
    var Order = require('../../models/orderModel'),
        User = require('../../models/userModel');
    Order.find({
        payment: {$in: [1, 3]},
        refundChannel: refundChannel,
        deleteFlg: 0,
        $where: 'this.status[this.status.length-1]._id==7'
    }, '_id payment _userId sportBeans type').populate('_userId', 'iPush').exec((err, os) => {
        if (err) {
            console.error('refundTime:' + err);
        } else {
            async.map(os, (o, cb) => {
                let wxConfig = o.payment == 1 ? payConf.getConf4Wechat() : payConf.getConf4App();
                wxPay.api.refund.query(wxConfig, {
                    out_refund_no: `orn${o._id}`
                }, (err, data) => {
                    /*SUCCESS—退款成功
                     FAIL—退款失败
                     PROCESSING—退款处理中
                     NOTSURE—未确定，需要商户原退款单号重新发起
                     CHANGE—转入代发，退款到银行发现用户的卡作废或者冻结了，导致原路退款银行卡失败，资金回流到商户的现金帐号，需要商户人工干预，通过线下或者财付通转账的方式进行退款。*/
                    if (data.refund_status_0 && data.refund_status_0 != 'PROCESSING') {
                        Order.update({_id: o._id}, {
                            $push: {
                                status: {
                                    _id: 8,
                                    time: Date.now()
                                }
                            },
                            refundStatus: data.refund_status_0
                        }, function (err) {
                            if (err) return cb(err);
                            let u = o._userId;
                            iPush.pushMsg(o.type < 3 ? 1 : 3, `您的订单${o._id}，已退款`, o._id, u.iPush.clientId, u.iPush.ua, (err, r)=> {
                                if (err) console.error('notify alipay push:' + err);
                            });
                            cb(null);
                        });
                        console.log('refundTime:' + JSON.stringify(data));
                    } else {
                        cb(err);
                    }
                });
            }, (err)=> {
                if (err) {
                    console.error('refundTime:' + err);
                } else {
                    console.log('refundTime exec success,at time:' + (new Date()));
                }
            });
        }
    });
}
function tokenTime() {
    qn.uptoken();
}
function holidayTime() {
    utils.isHoliday(moment().format('YYYYMMDD'), flg => holiday.todayIsHoliday = flg);
}
function orderTime() {
    const Order = require('../../models/orderModel');
    Order.find({
        deleteFlg: 0,
        $where: `this.status[this.status.length-1]._id==0 && ((this.type<3 && this.status[this.status.length-1].time<${Date.now() - 2 * 60 * 60 * 1000})||(this.type==3 && this.status[this.status.length-1].time<${Date.now() - 24 * 60 * 60 * 1000}))`
    }, '_id', (err, os) => {
        if (err) {
            console.error('orderTime:' + err);
        } else {
            async.map(os, (o, cb) => {
                Order.update({_id: o._id}, {
                    $push: {
                        status: {
                            _id: 6,
                            time: Date.now()
                        }
                    }
                }, err=>cb(err, o._id));
            }, (err, oIds)=> {
                if (err) {
                    console.error('orderTime:' + err);
                } else {
                    console.log('orderTime exec orderIds:' + oIds + ',at time:' + (new Date()));
                }
            });
        }
    });
}
function orderTimeoutTime() {
    const Order = require('../../models/orderModel');
    let curDate = moment(), date = curDate.format('YYYY-MM-DD'), time = curDate.format('HH:mm');
    Order.find({
        type: {$lt: 3},
        date: date,
        'orderTimes.times': {$lte: time},
        deleteFlg: 0,
        $where: 'this.status[this.status.length-1]._id==0'
    }, '_id', (err, os) => {
        if (err) {
            console.error('orderTimeoutTime:' + err);
        } else {
            async.map(os, (o, cb) => {
                Order.update({_id: o._id}, {
                    $push: {
                        status: {
                            _id: 6,
                            time: Date.now()
                        }
                    }
                }, err=>cb(err, o._id));
            }, (err, oIds)=> {
                if (err) {
                    console.error('orderTimeoutTime:' + err);
                } else {
                    console.log('orderTimeoutTime exec orderIds:' + oIds + ',at time:' + (new Date()));
                }
            });
        }
    });
}
function orderCloseTime() {
    const Order = require('../../models/orderModel'),
        User = require('../../models/userModel');
    let hoursBefore = moment().add(-1, 'h'), date = hoursBefore.format('YYYY-MM-DD'), time = hoursBefore.format('HH:mm');
    Order.find({
        type: {$lt: 3},
        date,
        'orderTimes.times': {$not: {$gt: time}},
        deleteFlg: 0,
        $where: 'this.status[this.status.length-1]._id==2'
    }, '_id _userId', (err, os) => {
        if (err) {
            console.error('orderCloseTime:' + err);
        } else {
            async.map(os, (o, cb) => {
                Order.update({_id: o._id}, {
                    $push: {
                        status: {
                            _id: 3,
                            time: Date.now()
                        }
                    }
                }, err=> {
                    User.pushInfo(o._userId, (err, p)=> {
                        if (err) return console.error(err);
                        if (p) {
                            let msg = `订单:${o._id}，已完成`;
                            iPush.pushMsg(1, msg, o._id, p.clientId, utils.userAgentType(p.ua) === 'i', (err, res)=> {
                                if (err) console.error(`orderCloseTime-push:${err}`);
                            });
                        }
                    });
                    cb(err, o._id);
                });
            }, (err, oIds)=> {
                if (err) {
                    console.error('orderCloseTime:' + err);
                } else {
                    console.log('orderCloseTime exec orderIds:' + oIds + ',at time:' + (new Date()));
                }
            });
        }
    });
}
function orderClose3Time() { // 商城订单完毕
    const Order = require('../../models/orderModel'),
        User = require('../../models/userModel');
    let hoursBefore = moment().add(-1, 'h'), date = hoursBefore.format('YYYY-MM-DD'), time = hoursBefore.format('HH:mm');
    Order.find({
        type: 3,
        deleteFlg: 0,
        $where: `this.status[this.status.length-1]._id==9 && this.status[this.status.length-1].time<${Date.now() - 3 * (isProduction ? 24 * 60 : 1) * 60 * 1000}`
    }, '_id', (err, os) => {
        if (err) {
            console.error('orderClose3Time:' + err);
        } else {
            async.map(os, (o, cb) => {
                Order.update({_id: o._id}, {
                    $push: {
                        status: {
                            _id: 3,
                            time: Date.now()
                        }
                    }
                }, err=> {
                    User.pushInfo(o._userId, (err, p)=> {
                        if (err) return console.error(err);
                        if (p) {
                            let msg = `订单:${o._id}，已完成`;
                            iPush.pushMsg(3, msg, o._id, p.clientId, utils.userAgentType(p.ua) === 'i', (err, res)=> {
                                if (err) console.error(`orderCloseTime-push:${err}`);
                            });
                        }
                    });
                    cb(err, o._id);
                });
            }, (err, oIds)=> {
                if (err) {
                    console.error('orderClose3Time:' + err);
                } else {
                    console.log('orderClose3Time exec orderIds:' + oIds + ',at time:' + (new Date()));
                }
            });
        }
    });
}

function arrangeEndTime() {
    const Arrange = require('../../models/arrangeModel');
    let curDate = moment().add(5, 'm'), date = curDate.format('YYYY-MM-DD'), time = curDate.format('HH:mm');
    Arrange.find({status: 1, 'arrTime.date': date, 'arrTime.time': {$lte: time}}, '_id', (err, as)=> {
        if (err) return console.error('arrangeEndTime:' + err);
        async.map(as, (a, cb)=> {
            Arrange.update({_id: a._id}, {status: 2}, err=>cb(err, a._id));
        }, (err, ret)=> {
            if (err) {
                console.error(`arrangeEndTime:${err}`);
            } else {
                console.log(`arrangeEndTime exec arrangeIds:${ret},at time:${new Date}`);
            }
        });
    });
}
