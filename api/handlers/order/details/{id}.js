'use strict';

var Order = require('../../../models/orderModel');

module.exports = {

    get(req, res, next) {
        Order.findOne({
            _id: req.params.id,
            _userId: req.user._id
        }, {
            type: 1,
            date: 1,
            orderTimes: 1,
            price: 1,
            payment: 1,
            sportBeans: 1,
            freight: 1,
            _venueId: 1,
            _clubId: 1,
            _actId: 1,
            products: 1,
            logistics: 1,
            address: 1,
            status: 1,
            createTime: 1,
            _userId: 1,
            refundFlg: 1
        }).populate('_venueId _clubId _actId', {
            _id: 1,
            name: 1,
            rebate: 1
        }).populate('_userId', {
            _id: 0,
            nick: 1,
            mobile: 1
        }).exec((err, o) => {
            if (err) return next(err);
            if (o && (o.type == 3)) {
                delete o._doc._userId;
                delete o._doc.orderTimes;
                delete o._doc.date;
            } else if (o) {
                delete o._doc.products;
                delete o._doc.logistics;
                delete o._doc.address;
                delete o._doc.freight;
            }
            res.json(o);
        });
    }

};
