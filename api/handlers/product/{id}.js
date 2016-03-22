'use strict';

var Product = require('../../models/productModel'),
    Activity = require('../../models/activityModel'),
    m = require('moment');

module.exports = {

    get(req, res, next) {
        Product.findOne({_id: req.params.id}, '-createTime -inventory -comments', (err, p)=> {
            if (err) return next(err);
            Activity.findOne({endDate: {$gt: m().format('YYYY-MM-DD')}, products: p._id}, '_id', (err, a)=> {
                if (err) return next(err);
                p._doc._inActivity = a ? 1 : 0;
                res.json(p);
            });
        });
    }
};