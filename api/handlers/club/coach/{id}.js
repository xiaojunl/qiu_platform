'use strict';

var Coach = require('../../../models/coachModel');

module.exports = {

    get: function (req, res, next) {
        Coach.findOne({_id: req.params.id}, 'name sex level age imgUrl introduce price spacePriceFlg deleteFlg', function (err, c) {
            if (err) return next(err);
            res.json(c);
        });
    }

};
