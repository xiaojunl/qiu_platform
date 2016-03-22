/**
 * Created by jungle on 15-10-14.
 */
'use strict';

const Venue = require('../../models/venueModel'),
    Coach = require('../../models/coachModel'),
    Order = require('../../models/orderModel'),
    Product = require('../../models/productModel'),
    async = require('async'),
    _ = require('underscore')._;

module.exports = {
    put(req, res, next) { // 场馆&俱乐部订单评论
        let body = req.body, comment = {
            comm: body.comm,
            env: body.env,
            serve: body.serve,
            profess: body.profess,
            communication: body.communication
        };
        Order.findOne({
            _id: body.orderId,
            _userId: req.user._id
        }, 'type _venueId orderTimes', (err, o) => {
            if (err) return next(err);
            Order.update({_id: o._id}, {_hasComm: 1}, err=> {
                if (err) return next(err);
                comment._userId = req.user._id;
                comment.time = Date.now();

                switch (o.type) { //订单类型 1:场馆，2：俱乐部
                    case 1:
                        Venue.update({_id: o._venueId}, {$push: {comments: comment}}, err=>err ? next(err) : res.send());
                        break;
                    case 2:
                        Coach.update({_id: o.orderTimes[0]._id}, {$push: {comments: comment}}, err=>err ? next(err) : res.send());
                        break;
                    default:
                        res.sendStatus(404);
                        break;
                }
            });
        });
    },
    post(req, res, next) {  // 场馆订单评论
        let body = req.body;
        Order.update({_id: body.orderId, _userId: req.user._id}, {_hasComm: 1}, err=> {
            if (err) return next(err);
            async.map(body.prodComms, (pc, cb)=> {
                Product.update({_id: pc.productId}, {
                    $push: {
                        comments: {
                            _userId: req.user._id,
                            comm: pc.comm,
                            time: Date.now()
                        }
                    }
                }, err=>cb(err, pc.productId));
            }, err=> err ? next(err) : res.send());
        });
    }
};