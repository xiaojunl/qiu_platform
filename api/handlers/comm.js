'use strict';

var common = require('../config/config').common;

module.exports = {

    get: function (req, res) {
        common.nowTime = Date.now();
        res.json(common);
    }

};
