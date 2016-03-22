/**
 * Created by jungle on 15-9-11.
 */
'use strict';

var execFile = require('child_process').execFile,
    path = require('path'),
    https = require('https'),
    util = require('util'),
//weixin = require('../config/config').weixin,
    User = require('../models/userModel'),
    qn = require('../lib/qn-qi'),
    utils = require('../lib/utils'),
    wxApi = require('node-weixin-api');

module.exports = {

    post(req, res) {
        // TODO if unabled.
        //var webhooks = req.body.webhooks;
        //if (hook.password === 'miaotu4qi' && hook.push_data) {
        console.log('webhook auto deploy at:' + (Date.now()));
        execFile(path.resolve('../auto_deploy.sh'), function (err, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (err) {
                console.error('exec error: ' + err);
            }
        });
        res.send('success');
        //} else {
        //    res.status(500).send('illegal password.');
        //}
    },
    get(req, res, next) {

        wxApi.callback.oauth.success(req, res, function (json) {

            User.findOne({openId: json.openid}, '_id', function (err, u) {
                if (err) return next(err);
                if (!u) {
                    wxApi.auth.determine(function () {
                        wxApi.api.user.info(json.openid, function (err, json) {
                            if (err.errcode) return next(JSON.stringify(err));
                            if (json.headimgurl) {
                                let filename = utils.genFileName('image/jpeg', 'wx');
                                qn.uploadHttp(json.headimgurl, filename, function (err) {
                                    if (err) return next(err);
                                    saveUser(json.openid, json.nickname, json.sex, filename, req, res, next);
                                });
                            } else {
                                saveUser(json.openid, json.nickname, json.sex, null, req, res, next);
                            }
                        });
                    });
                } else {
                    resHandler(u._id, req, res, next);
                }
            });
        });
    }
};


function saveUser(openId, nick, sex, imgUrl, req, res, next) {
    var user = new User({
        openId: openId,
        type: 1,
        nick: nick,
        sex: sex,
        imgUrl: imgUrl,
        createTime: Date.now()
    });
    if (!imgUrl) delete user.imgUrl;
    user.save(function (err) {
        if (err) return next(err);
        resHandler(user._id, req, res, next);
    });
}

function resHandler(userId, req, res, next) {
    let state = req.query.state;
    req.logIn({_id: userId}, function (err) {
        if (err) return next(err);
        var reqUrl = '/wechat/';
        switch (state) {
            case 'venue':
                reqUrl += '#/reservVenue';
                break;
            case 'coach':
                reqUrl += '#/reservClub';
                break;
            case 'order':
                reqUrl += '#/orderList';
                break;
            case 'account':
                reqUrl += '#/account';
                break;
            case 'tiequan':
                reqUrl += '#/getSportBeans';
                break;
            default:
                reqUrl += '';
                break;
        }
        res.redirect(reqUrl);
    });
}