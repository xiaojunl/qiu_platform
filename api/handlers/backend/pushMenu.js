/**
 * Created by jungle on 15-9-11.
 */
'use strict';

const wxApi = require('node-weixin-api'),
    menu = require('../../config/menu4weixin');

module.exports = {

    get(req, res, next) {
        wxApi.auth.determine(function () {
            wxApi.api.menu.create(menu, function (error, json) {
                if (json.errcode) return next(errmsg);
                res.send('success.');
            });
        });
    }

};