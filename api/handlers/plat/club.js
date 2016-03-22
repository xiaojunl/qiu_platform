'use strict';

var Club = require('../../models/clubModel'),
    User = require('../../models/userModel'),
    error = require('../../lib/error'),
    paginate = require('../../lib/paginate'),
    _ = require('underscore')._;

module.exports = {

    post: function (req, res, next) {
        User.isExists(req.body.username, function (err, flg) {
            if (err) return next(err);
            if (flg) {
                res.status(400).json(error(40002, 'username exists.'));
            } else {
                var nowTime = Date.now();
                var club = new Club({
                    name: req.body.name,
                    mobile: req.body.mobile,
                    contactName: req.body.contactName,
                    scheduleFlg: 1,
                    refundFlg: 1,
                    createTime: nowTime,
                    deleteFlg: 1
                });
                club.save(function (err) {
                    if (err) return next(err);

                    var user = new User(req.body);
                    user.createTime = nowTime;
                    user.type = 3;
                    user._clubId = club._id;
                    user.save(function (err) {
                        if (err) return next(err);
                        res.sendStatus(200);
                    });
                });
            }
        });
    },
    put: function (req, res, next) {
        Club.update({_id: req.body.id}, {deleteFlg: req.body.deleteFlg}, function (err) {
            if (err) return next(err);
            res.sendStatus(200);
        });
    },
    get: function (req, res, next) {
        let q = req.query, searchField = q.searchField ? q.searchField.trim() : undefined;
        if (!searchField) {
            User.paginate({type: 3, deleteFlg: 0}, {
                columns: 'username _clubId',
                populate: {
                    path: '_clubId', select: 'name contactName mobile deleteFlg coachCount'
                },
                page: q.page,
                limit: q.limit,
                sortBy: {_id: -1},
                lean: true
            }, function (err, results, pageCount, itemCount) {
                if (err) return next(err);
                res.json(paginate(results, pageCount, itemCount));
            });
        } else {
            User.find({
                type: 3,
                deleteFlg: 0
            }, 'username _clubId', {_id: -1}).populate('_clubId', 'name contactName mobile deleteFlg coachCount').exec((err, us)=> {
                if (err) return next(err);
                us = _.filter(us, u=> {
                    return u.username.indexOf(searchField) > -1 || u._clubId.name.indexOf(searchField) > -1;
                });
                let offset = (q.page - 1) * q.limit;
                res.json(paginate(us.slice(offset, offset + q.limit), Math.ceil(us.length / q.limit), us.length));
            });
        }
    }

};
