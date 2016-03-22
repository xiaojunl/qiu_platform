'use strict';

var Address = require('../models/addressModel');

module.exports = {

    post(req, res, next) {
        let addr = new Address(req.body);
        addr._userId = req.user._id;
        addr.createTime = Date.now();
        addr.save(err=>err ? next(err) : res.send());
    },
    put(req, res, next){
        let body = req.body;
        Address.update({_id: body.id}, body, err=>err ? next(err) : res.send());
    },
    get: function (req, res) {
        Address.find({_userId: req.user._id}, 'name mobile address deliveryTime', {sort: {_id: -1}}, (err, as)=> err ? next(err) : res.json(as));
    }
};
