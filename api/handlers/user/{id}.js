'use strict';

var User = require('../../models/userModel'),
    error = require('../../lib/error');

module.exports = {

    delete: function (req, res, next) {
        if (isNaN(req.params.id)) {
            res.status(401).json(error(40102, '{id} must be a number.'))
        } else {
            res.sendStatus(200);
        }

    }

};
