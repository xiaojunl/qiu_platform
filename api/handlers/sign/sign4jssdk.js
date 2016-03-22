/**
 * Created by jungle on 15-9-11.
 */
'use strict';

var wxApi = require('node-weixin-api');

module.exports = {

    get: function (req, res, next) {
        wxApi.api.jssdk.prepare(function (err, json) {
            if (err.errcode) return next(JSON.stringify(err));
            res.json(json);
        });
    }

};