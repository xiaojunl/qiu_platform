'use strict';

var SportBeans = require('../../../models/sportBeansModel'),
    near = require('../../../config/config').near,
    _ = require('underscore')._;

module.exports = {

    get(req, res, next) {
        const sId = req.query.sId;
        let sortQ = {sort: {'status.time': -1}};
        if (!sId && sId != 0) {
            sortQ.skip = 0, sortQ.limit = near.limit;
        }
        SportBeans.find({
            _userId: req.user._id,
            $where: `this.status[this.status.length-1]._id>0`
        }, {
            payment: 1,
            price: 1,
            beans: 1,
            status: {$slice: -1},
            _orderId: 1
        }, sortQ, (err, sbs) => {
            if (err) return next(err);
            if (sId || sId == 0) {
                let i = 0;
                for (; i < sbs.length; i++) {
                    if (sbs[i]._id == sId) {
                        break;
                    }
                }
                sbs = sbs.slice(i + 1, i + 1 + near.limit);
            }
            let rets = [];
            _.each(sbs, s=> {
                let msg = "";
                switch (s.status[0]._id) {
                    case 1:
                        msg = `您通过${s.payment == 2 ? '支付宝' : '微信支付'}充值了${s.price}元，共获得${s.beans}粒运动豆`;
                        break;
                    case 2:
                        msg = `订单【${s._orderId}】消耗了运动豆【${s.beans}】粒`;
                        break;
                    case 3:
                        msg = `订单【${s._orderId}】被取消，抵用运动豆【${s.beans}】粒已退回到您的账户`;
                        break;
                    case 4:
                        msg = ` 新用户赠送【${s.beans}】粒运动豆，已放入您的账号`;
                        break;
                }
                rets.push({msg, time: s.status[0].time});
            });
            res.json(rets);
        });
    }

};
