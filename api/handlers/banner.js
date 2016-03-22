'use strict';

var Banner = require('../models/bannerModel'),
    qn = require('../lib/qn-qi'),
    utils = require('../lib/utils');

module.exports = {

    get(req, res, next) {
        Banner.find({}, 'name modifyTime', {sort: {sort: -1}}, function (err, bs) {
            if (err) return next(err);
            res.json(bs);
        });
    },
    post(req, res, next) {
        let banner = new Banner(req.body);
        banner.modifyTime = (banner.createTime = Date.now());

        let item = req.files.file0;
        let filename = utils.genFileName(item.type, req.user._id);
        qn.uploadFile(item.path, filename, function (err) {
            if (err) return next(err);
            banner.imgUrl = filename;
            banner.save(function (err) {
                if (err) return next(err);
                res.sendStatus(200);
            });
        });
    },
    put(req, res, next) {
        let item = req.files.file0, body = req.body;
        if (item && item.path) {
            if (!utils.startsWith(item.name, req.user._id + 'qi')) {
                var filename = utils.genFileName(item.type, req.user._id);
                qn.uploadFile(item.path, filename, function (err) {
                    if (err) return next(err);
                    body.imgUrl = filename;
                    body.modifyTime = Date.now();
                    Banner.update({_id: body.id}, body, function (err) {
                        if (err) return next(err);
                        res.sendStatus(200);
                    });
                });
            } else {
                body.modifyTime = Date.now();
                Banner.update({_id: body.id}, body, function (err) {
                    if (err) return next(err);
                    res.sendStatus(200);
                });
            }
        } else {
            body.modifyTime = Date.now();
            Banner.update({_id: body.id}, body, function (err) {
                if (err) return next(err);
                res.sendStatus(200);
            });
        }
    }

};
