'use strict';

var Club = require('../../models/clubModel'),
    Coach = require('../../models/coachModel'),
    User = require('../../models/userModel');

module.exports = {

    get: function (req, res, next) {
        Club.findOne({_id: req.params.id}, 'name', function (err, c) {
            if (err) return next(err);
            Coach.find({
                _clubId: c._id,
                deleteFlg: 0
            }, 'name imgUrl age professAvg communicationAvg price spacePriceFlg', {sort: {_id: 1}}, function (err, cs) {
                if (err) return next(err);
                c._doc.coaches = cs;
                res.json(c);
            });
        });
    }

};
