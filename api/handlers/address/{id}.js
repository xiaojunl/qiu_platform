'use strict';

var Address = require('../../models/addressModel');

module.exports = {

    delete(req, res, next) {
        Address.remove({
            _id: req.params.id
        }, err=>err ? next(err) : res.send());
    }
};