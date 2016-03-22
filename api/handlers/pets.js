'use strict';

var Pet = require('../models/petModel');

module.exports = {

    get: function (req, res) {
        Pet.findOne({_id: 1}, function (err, p) {
            res.json(p===null?'pets empty'+req.body.tst:p);
        });
    }

};
