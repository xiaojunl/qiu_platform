'use strict';

var Order = require('../models/orderModel'),
    Venue = require('../models/venueModel'),
    Club = require('../models/clubModel'),
    Coach = require('../models/coachModel'),
    near = require('../config/config').near,
    error = require('../lib/error'),
    utils = require('../lib/utils'),
    async = require('async'),
    _ = require('underscore')._;

module.exports = {

    post(req, res, next){   // 订单提交
        let order = new Order(req.body);
        order._userId = req.user._id;
        order.status = [{_id: 0, time: order.createTime = Date.now()}];

        // check orderTimes.
        var queryQ = {
            type: order.type,
            date: order.date,
            deleteFlg: 0,
            $where: 'this.status[this.status.length-1]._id<=3'
        };
        if (order._venueId || order._venueId === 0) {
            queryQ._venueId = order._venueId;
        } else {
            queryQ._clubId = order._clubId;
        }
        Order.find(queryQ, 'orderTimes', (err, odrs)=> {
            if (err) return next(err);
            let mergeTimes = [];
            if (!_.isEmpty(odrs)) {
                let orderTimes = _.flatten(_.pluck(odrs, 'orderTimes'), true);
                _.each(order.orderTimes, ot=> {
                    let cOt = _.clone(ot), times = _.flatten(_.pluck(_.where(orderTimes, {_id: cOt._id}), 'times'));
                    if (!_.isEmpty(cOt.times = _.intersection(times, cOt.times))) {
                        mergeTimes.push(cOt);
                    }
                });
            }
            if (!_.isEmpty(mergeTimes)) {
                res.status(460).json(error(46001, '存在已被他人选定时段', mergeTimes));
            } else {
                if (order.type == 1) { // 场馆
                    Venue.findOne({_id: order._venueId}, 'refundFlg', function (err, v) {
                        if (err) return next(err);
                        order.refundFlg = v.refundFlg;
                        order.save(err=>err ? next(err) : res.json({_id: order._id}));
                    });
                } else {
                    Club.findOne({_id: order._clubId}, 'refundFlg', function (err, c) {
                        if (err) return next(err);
                        order.refundFlg = c.refundFlg;
                        order.save(err=>err ? next(err) : res.json({_id: order._id}));
                    });
                }
            }
        });
    },
    get(req, res, next) {
        const oId = req.query.oId;
        let qCon = {_userId: req.user._id, deleteFlg: 0}, sortQ = {sort: {_id: -1}};
        if (!oId && oId != 0) {
            sortQ.skip = 0, sortQ.limit = near.limit;
        }
        if (utils.userAgentType(req.headers['user-agent']) === 'wx') {
            qCon.type = {$lt: 3};
        }
        Order.find(qCon, {
            type: 1,
            price: 1,
            date: 1,
            orderTimes: 1,
            createTime: 1,
            status: {$slice: -1},
            _venueId: 1,
            _clubId: 1,
            _actId: 1,
            freight: 1,
            products: 1,
            _hasComm: 1
        }, sortQ).populate('_venueId _clubId _actId', {
            _id: 1,
            name: 1,
            rebate: 1,
            imgUrls: {$slice: 1}
        }).exec((err, os) => {
            if (err) return next(err);
            if (oId || oId == 0) {
                let i = 0;
                for (; i < os.length; i++) {
                    if (os[i]._id == oId) {
                        break;
                    }
                }
                os = os.slice(i + 1, i + 1 + near.limit);

            }
            res.json({data: os, more: os.length === near.limit});
        });
    }

};
