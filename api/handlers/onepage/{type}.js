'use strict';

var OnePage = require('../../models/onepageModel');

module.exports = {

    get(req, res, next) {
        res.set('Content-Type', 'text/html');
        OnePage.findOne({type: req.params.type}, 'content', (err, op) => err ? next(err) : res.send(op.content));
    },
    put(req, res, next) {
        req.body.modifyTime = Date.now();
        OnePage.update({type: req.params.type}, {content: req.body.content}, err=>err ? next(err) : res.sendStatus(200));
    }

};
