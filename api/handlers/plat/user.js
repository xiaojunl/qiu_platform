'use strict';

var User = require('../../models/userModel');

module.exports = {

    get(req, res, next) {

        User.aggregate({$match: {createTime: {$ne: null}, type: {$lt: 4}}}, {
            $group: {
                _id: {
                    time: {$subtract: ["$createTime", {$mod: ["$createTime", 1000 * 60 * 60 * 24]}]},
                    type: "$type"
                }, count: {$sum: 1}
            }
        }, {
            $group: {
                _id: "$_id.time",
                types: {$addToSet: {typeId: "$_id.type", count: "$count"}}
            }
        }, {$sort: {_id: -1}}, (err, d) => err ? next(err) : res.json(d));
    }

};
