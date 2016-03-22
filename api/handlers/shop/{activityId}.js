/**
 * Created by jungle on 15-10-18.
 */
'use strict';

const Activity = require('../../models/activityModel'),
    Product = require('../../models/productModel'),
    error = require('../../lib/error'),
    m = require('moment'),
    _ = require('underscore')._;

module.exports = {
    get(req, res, next) {
        Activity.findOne({_id: req.params.activityId}, 'name endDate rebate products').populate('products', {
            name: 1,
            price: 1,
            imgUrls: {$slice: 1}
        }).exec((err, a)=> {
            if (err) return next(err);
            a._doc._status = (m().format('YYYY-MM-DD') > a.endDate) ? 2 : 1;
            a._doc._duration = durationSecs(`${a.endDate} 23:59:59`);
            delete a._doc.endDate;
            res.json(a);
        });
    },
    post(req, res, next) {
        let productIds = req.body.productIds,
            ids = _.pluck(productIds, '_id'); //[{_id:1,propId:'1'}]
        Activity.findOne({
            _id: req.params.activityId,
            beginDate: {$lte: m().format('YYYY-MM-DD')},
            endDate: {$gte: m().format('YYYY-MM-DD')}
        }, 'endDate rebate products', (err, a)=> {
            if (err) return next(err);
            if (!a) return res.status(406).json(error(40601, '活动过期'));
            let ins = _.intersection(a.products, ids);
            if (ids.length === 0) return res.status(400).json(error(40001, 'invalid productIds.'));
            Product.find({_id: {$in: ins}}, {name: 1, price: 1, imgUrls: {$slice: 1}, combProps: 1}, (err, ps) => {
                if (err) return next(err);
                if (_.isEmpty(ps)) return res.status(400).json(error(40001, 'invalid productIds.'));
                _.each(ps, p=> {
                    let propIds = _.pluck(_.where(productIds, {_id: p._id}), 'propId');
                    if (propIds) {
                        p._doc.combProps = _.filter(p.combProps, cp=>_.contains(propIds, `${cp._id}`));
                    }
                });
                a._doc.endDate = `${a.endDate} 23:59:59`;
                a._doc.products = ps;
                res.json(a);
            });
        });
    }
};

// dateTime format:2015-10-18 18:00:00
function durationSecs(dateTime) {
    var startDate = new Date();
    var endDate = new Date(dateTime);
    var df = (endDate.getTime() - startDate.getTime()) / 1000;
    return Math.floor(df);
}