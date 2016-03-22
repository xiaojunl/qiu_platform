'use strict';

var User = require('../../models/userModel');

module.exports = {

    get(req, res, next) {
        req.logout();
        res.clearCookie('authToken');
        res.clearCookie('sequence');
        res.send();
    }
};
