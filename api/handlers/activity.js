/**
 * 活动
 * Created by jungle on 15-10-17.
 */
'use strict';

const Activity = require('../models/activityModel'),
    Product = require('../models/productModel'),
    utils = require('../lib/utils'),
    qn = require('../lib/qn-qi'),
    error = require('../lib/error'),
    paginate = require('../lib/paginate'),
    _ = require('underscore')._,
    m = require('moment');

module.exports = {
    post(req, res, next) {
        let act = new Activity(req.body), extra = JSON.parse(req.body.extra);
        if (extra) {
            act.products = extra.products;
        }
        let item = req.files.file0;
        var filename = utils.genFileName(item.type, req.user._id);
        qn.uploadFile(item.path, filename, function (err) {
            act.imgUrl = filename;
            act.createTime = Date.now();
            minPrice(act.products, price=> {
                act.basePrice = (price * act.rebate * 0.1).toFixed(2);
                act.save(err=>err ? next(err) : res.sendStatus(200));
            });
        });
    }, put(req, res, next) {
        let body = req.body;
        let extra = JSON.parse(body.extra);
        if (extra) {
            body.products = extra.products;
        }
        Activity.findOne({
            _id: body.id,
            beginDate: {$lte: m().format('YYYY-MM-DD')}
        }, '_id', (err, a)=> {
            if (err) return next(err);
            if (a)return res.status(406).json(error(40601, '只有未开始的活动可以编辑'));
            minPrice(body.products, price=> {
                body.basePrice = (price * body.rebate * 0.1).toFixed(2);
                let item = req.files.file0;
                if (item && !utils.startsWith(item.name, req.user._id + 'qi')) {
                    var filename = utils.genFileName(item.type, req.user._id);
                    qn.uploadFile(item.path, filename, function (err) {
                        if (err) return next(err);
                        body.imgUrl = filename;
                        Activity.update({_id: body.id}, body, err=>err ? next(err) : res.sendStatus(200));
                    });
                } else {
                    Activity.update({_id: body.id}, body, err=>err ? next(err) : res.sendStatus(200));
                }
            });
        });
    }, get(req, res, next) {
        let q = req.query, searchField = q.searchField ? q.searchField.trim() : '';
        Activity.paginate({$or: [{name: {$regex: searchField}}]}, {
            columns: 'name beginDate endDate count',
            page: q.page,
            limit: q.limit,
            sortBy: {_id: -1},
            lean: true
        }, (err, results, pageCount, itemCount)=>err ? next(err) : res.json(paginate(results, pageCount, itemCount)));
    }
};

function minPrice(pIds, cb) {
    if (!_.isEmpty(pIds)) {
        Product.find({_id: {$in: pIds}}, 'price', {
            sort: {price: 1},
            limit: 1
        }, (err, pis) => cb(pis && pis.length > 0 ? pis[0].price : 0));
    } else {
        cb(0);
    }
}