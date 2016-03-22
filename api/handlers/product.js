'use strict';

var Product = require('../models/productModel'),
    qn = require('../lib/qn-qi'),
    error = require('../lib/error'),
    utils = require('../lib/utils'),
    paginate = require('../lib/paginate'),
    async = require('async'),
    _ = require('underscore')._;

module.exports = {

    post(req, res, next) {
        Product.isExists(req.body.no, req.body.name, (err, flg)=> {
            if (err) return next(err);
            if (flg) return res.status(460).json(error(46001, '编号或商品名已存在'));
            let prod = new Product(req.body);
            prod.createTime = Date.now();
            prod.inventory = 0;
            _.each(prod.combProps, cp=> {
                if (cp.status) prod.inventory += cp.inventory;
            });

            let file_obj2 = [];
            if (req.files && req.files.file0) {
                file_obj2.push(req.files.file0);
            }
            if (req.files && req.files.file1) {
                file_obj2.push(req.files.file1);
            }
            if (req.files && req.files.file2) {
                file_obj2.push(req.files.file2);
            }
            if (req.files && req.files.file3) {
                file_obj2.push(req.files.file3);
            }
            if (req.files && req.files.file4) {
                file_obj2.push(req.files.file4);
            }

            // fileupload
            async.map(file_obj2, function (item, callback) {
                var filename = utils.genFileName(item.type, req.user._id);
                qn.uploadFile(item.path, filename, function (err) {
                    callback(err, filename);
                });
            }, function (err, imgs) {
                if (err) return next(err);
                if (!_.isEmpty(imgs)) {
                    prod.imgUrls = imgs;
                }
                prod.save(err=>err ? next(err) : res.sendStatus(200));
            });
        });
    },
    put(req, res, next) {
        let body = req.body;

        Product.isExists(body.no, body.name, (err, flg, _id)=> {
            if (err) return next(err);
            if (flg && body.id !== _id) return res.status(460).json(error(46001, '编号或商品名已存在'));
            let file_obj2 = [];
            if (req.files && req.files.file0) {
                file_obj2.push(req.files.file0);
            }
            if (req.files && req.files.file1) {
                file_obj2.push(req.files.file1);
            }
            if (req.files && req.files.file2) {
                file_obj2.push(req.files.file2);
            }
            if (req.files && req.files.file3) {
                file_obj2.push(req.files.file3);
            }
            if (req.files && req.files.file4) {
                file_obj2.push(req.files.file4);
            }

            // fileupload
            async.map(file_obj2, function (item, callback) {
                if (!utils.startsWith(item.name, req.user._id + 'qi')) {
                    var filename = utils.genFileName(item.type, req.user._id);
                    qn.uploadFile(item.path, filename, function (err) {
                        callback(err, filename);
                    });
                } else {
                    callback(null, item.name);
                }
            }, function (err, imgs) {
                if (err) return next(err);
                if (!_.isEmpty(imgs)) {
                    body.imgUrls = imgs;
                }
                body.inventory = 0;
                _.each(body.combProps, cp=> {
                    if (cp.status) body.inventory += cp.inventory;
                });
                Product.update({_id: body.id}, body, err=>err ? next(err) : res.sendStatus(200));
            });
        });
    },
    get(req, res, next) {
        let q = req.query, searchField = q.searchField ? q.searchField.trim() : '';
        Product.paginate({$or: [{no: {$regex: searchField}},{name: {$regex: searchField}},{brand: {$regex: searchField}}]}, {
            columns: 'no name brand price createTime',
            page: q.page,
            limit: q.limit,
            sortBy: {_id: -1},
            lean: true
        }, (err, results, pageCount, itemCount)=>err ? next(err) : res.json(paginate(results, pageCount, itemCount)));
    }

};
