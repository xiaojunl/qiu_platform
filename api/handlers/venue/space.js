'use strict';

var Space = require('../../models/spaceModel'),
    Venue = require('../../models/venueModel'),
    error = require('../../lib/error'),
    paginate = require('../../lib/paginate');

module.exports = {

    post: function (req, res, next) {
        Space.isExists(req.user._venueId, req.body.name, function (err, flg) {
            if (err) return next(err);
            if (flg) {
                res.status(400).json(error(40002, 'name exists.'));
            } else {
                var space = new Space(req.body);
                space._venueId = req.user._venueId;
                space.createTime = Date.now();
                space.save(function (err) {
                    if (err) return next(err);
                    Venue.update({_id: space._venueId}, {$inc: {placeCount: 1}}, function (err) {
                        if (err) return next(err);
                        // 最低价/最高价
                        Venue.changePrice(space._venueId, function (err) {
                            if (err) return next(err);
                            res.sendStatus(200);
                        });
                    });
                });
            }
        });
    },
    put: function (req, res, next) {
        Space.isExists(req.user._venueId, req.body.name, function (err, flg, _id) {
            if (err) return next(err);
            if (flg && req.body.id != _id) {
                res.status(400).json(error(40002, 'name exists.'));
            } else {
                Space.update({_id: req.body.id}, req.body, function (err) {
                    if (err) return next(err);
                    Space.count({_venueId: req.user._venueId, deleteFlg: 0}, function (err, cnt) {
                        Venue.update({_id: req.user._venueId}, {placeCount: cnt}, function (err) {
                            if (err) return next(err);
                            // 最低价/最高价
                            Venue.changePrice(req.user._venueId, function (err) {
                                if (err) return next(err);
                                res.sendStatus(200);
                            });
                        });
                    });
                });
            }
        });
    },
    get: function (req, res, next) {
        let q = req.query, searchField = q.searchField ? q.searchField.trim() : '';
        Space.paginate({_venueId: req.user._venueId, $or: [{name: {$regex: searchField}}]}, {
            columns: 'name price weekPrice deleteFlg manCount priceTotal',
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
