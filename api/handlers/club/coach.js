'use strict';

var async = require('async'),
    Coach = require('../../models/coachModel'),
    Club = require('../../models/clubModel'),
    error = require('../../lib/error'),
    paginate = require('../../lib/paginate'),
    qn = require('../../lib/qn-qi'),
    utils = require('../../lib/utils');

module.exports = {

    post: function (req, res, next) {
        Coach.isExists(req.user._clubId, req.body.name, function (err, flg) {
            if (err) return next(err);
            if (flg) {
                res.status(400).json(error(40002, 'name exists.'));
            } else {
                async.waterfall([function (cb) {
                    var imgFile = req.files.file0;
                    if (imgFile) {
                        var filename = utils.genFileName(imgFile.type, req.user._id);
                        qn.uploadFile(imgFile.path, filename, function (err) {
                            cb(err, filename);
                        });
                    } else {
                        cb(null, null);
                    }
                }, function (filename, cb) {
                    var coach = new Coach(req.body);
                    coach._clubId = req.user._clubId;
                    coach.createTime = Date.now();
                    coach.imgUrl = filename;
                    coach.save(function (err) {
                        Club.update({_id: coach._clubId}, {$inc: {coachCount: 1}}, function (err) {
                            Club.changePrice(coach._clubId, function (err) {
                                cb(err);
                            });
                        })
                    });
                }], function (err) {
                    if (err) return next(err);
                    res.sendStatus(200);
                });
            }
        });
    },
    put: function (req, res, next) {
        Coach.isExists(req.user._clubId, req.body.name, function (err, flg, _id) {
            if (err) return next(err);
            if (flg && req.body.id != _id) {
                res.status(400).json(error(40002, 'name exists.'));
            } else {
                async.waterfall([function (cb) {
                    var imgFile = req.files.file0;
                    if (imgFile && imgFile.path) {
                        var filename = utils.genFileName(imgFile.type, req.user._id);
                        qn.uploadFile(imgFile.path, filename, function (err) {
                            cb(err, filename);
                        });
                    } else {
                        cb(null, null);
                    }
                }, function (filename, cb) {
                    if (filename) {
                        req.body.imgUrl = filename;
                    }
                    Coach.update({_id: req.body.id}, req.body, function (err) {
                        if (err) return cb(err);
                        Coach.count({_clubId: req.user._clubId, deleteFlg: 0}, function (err, cnt) {
                            if (err) return cb(err);
                            Club.update({_id: req.user._clubId}, {coachCount: cnt}, function (err) {
                                if (err) return cb(err);
                                // 最低价/最高价
                                Club.changePrice(req.user._clubId, function (err) {
                                    cb(err);
                                });
                            });
                        });
                    });
                }], function (err) {
                    if (err) return next(err);
                    res.sendStatus(200);
                });
            }
        });
    },
    get: function (req, res, next) {
        let q = req.query, searchField = q.searchField ? q.searchField.trim() : '';
        Coach.paginate({_clubId: req.user._clubId, $or: [{name: {$regex: searchField}}]}, {
            columns: 'name sex level age price manCount priceTotal',
            page: q.page,
            limit: q.limit,
            sortBy: {_id: -1},
            lean: true
        }, function (err, results, pageCount, itemCount) {
            if (err) return next(err);
            res.json(paginate(results, pageCount, itemCount));
        });
    }

};
