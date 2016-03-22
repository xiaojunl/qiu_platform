'use strict';

var Coach = require('../../../../models/coachModel');

module.exports = {

    get: function extra(req, res, next) {
        Coach.findOne({_id: req.params.id}, 'name imgUrl weekPrice manCount priceTotal professAvg communicationAvg comments', function (err, c) {
            if (err) return next(err);
            res.json(c);
        });
    }

};
