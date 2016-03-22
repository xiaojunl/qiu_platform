'use strict';

var Banner = require('../../models/bannerModel');

module.exports = {

    get(req, res, next) {
        Banner.findOne({_id: req.params.id}, '-createTime -modifyTime', (err, b) => err ? next(err) : res.json(b));
    },
    delete(req, res, next) {
        Banner.remove({_id: req.params.id}, err=>err ? next(err) : res.sendStatus(200));
    }

};
