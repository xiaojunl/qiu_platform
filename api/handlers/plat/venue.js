'use strict';

var Venue = require('../../models/venueModel'),
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
                var venue = new Venue({
                    name: req.body.name,
                    mobile: req.body.mobile,
                    contactName: req.body.contactName,
                    scheduleFlg: 1,
                    refundFlg: 1,
                    createTime: nowTime,
                    deleteFlg: 1
                });
                venue.save(function (err) {
                    if (err) return next(err);


                    var user = new User(req.body);
                    user.createTime = nowTime;
                    user.type = 2;
                    user._venueId = venue._id;
                    user.save(function (err) {
                        if (err) return next(err);
                        res.sendStatus(200);
                    });
                });
            }
        });
    },
    put: function (req, res, next) {
        Venue.update({_id: req.body.id}, {deleteFlg: req.body.deleteFlg}, function (err) {
            if (err) return next(err);
            res.sendStatus(200);
        });
    },
    get: function (req, res, next) {
        let q = req.query, searchField = q.searchField ? q.searchField.trim() : undefined;
        if (!searchField) {
            User.paginate({type: 2, deleteFlg: 0}, {
                columns: 'username _venueId',
                populate: {
                    path: '_venueId', select: 'name contactName mobile deleteFlg placeCount'
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
                type: 2,
                deleteFlg: 0
            }, 'username _venueId', {_id: -1}).populate('_venueId', 'name contactName mobile deleteFlg placeCount').exec((err, us)=> {
                if (err) return next(err);
                us = _.filter(us, u=> {
                    return u.username.indexOf(searchField) > -1 || u._venueId.name.indexOf(searchField) > -1;
                });
                let offset = (q.page - 1) * q.limit;
                res.json(paginate(us.slice(offset, offset + q.limit), Math.ceil(us.length / q.limit), us.length));
            });
        }
    }

};
