'use strict';

var Banner = require('../../../models/bannerModel');

module.exports = {

    get(req, res, next) {
        res.set('Content-Type', 'text/html');
        Banner.findOne({_id: req.params.id}, 'content', (err, b) => err ? next(err) : res.send(b.content));
    }

};
