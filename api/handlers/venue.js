'use strict';

var Venue = require('../models/venueModel'),
    qn = require('../lib/qn-qi'),
    utils = require('../lib/utils'),
    async = require('async'),
    _ = require("underscore")._;

module.exports = {
    get: function (req, res, next) {
        Venue.findOne({_id: req.user._venueId}, '-deleteFlg -createTime -comments -loc -placeCount -priceMin -priceMax -weekPriceMin -weekPriceMax', function (err, v) {
            if (err) return next(err);
            res.json(v);
        });
    },
    put: function (req, res, next) {
        var file_obj2 = [];
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
            if (item.path) {
                if (!utils.startsWith(item.name, req.user._id + 'qi')) {
                    var filename = utils.genFileName(item.type, req.user._id);
                    qn.uploadFile(item.path, filename, function (err) {
                        callback(err, filename);
                    });
                } else {
                    callback(null, item.name);
                }
            } else {
                callback(null, null);
            }
        }, function (err, imgs) {
            if (err) return next(err);
            if (!_.isEmpty(imgs)) {
                req.body.imgUrls = imgs;
            }
            if (req.body.extra) {
                var extra = JSON.parse(req.body.extra);
                req.body.loc = extra.loc;
                req.body.props = extra.props;
                req.body.flags = extra.flags;
                delete req.body.extra;
            }

            Venue.update({_id: req.user._venueId}, req.body, function (err) {
                if (err) return next(err);
                res.sendStatus(200);
            });
        });
    }
};
