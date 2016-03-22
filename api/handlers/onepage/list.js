'use strict';

var Onepage = require('../../models/onepageModel'),
    onepages = require('../../config/config').onepage,
    async = require('async');

module.exports = {

    get(req, res, next) {
        getOnepage(req, res, next);
    }

};

function getOnepage(req, res, next) {
    Onepage.find({}, 'name type modifyTime -_id', {sort: {type: 1}}, function (err, ops) {
        if (err) return next(err);
        if (ops.length < 1) {
            async.map(onepages, function (opb, cb) {
                let op = new Onepage(opb);
                op.modifyTime = (op.createTime = Date.now());
                op.save(err=>  cb(err, op.type));
            }, function (err, rets) {
                if (err) return next(err);
                console.log('onepage init:' + JSON.stringify(rets));
                getOnepage(req, res, next);
            });
        } else {
            res.json(ops);
        }
    });
}