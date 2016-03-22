'use strict';

const qn = require('../../lib/qn-qi'),
    error = require('../../lib/error'),
    utils = require('../../lib/utils'),
    User = require('../../models/userModel');

module.exports = {

    put(req, res, next) {
        let item = req.files.file0;
        if (item && item.path) {
            var filename = utils.genFileName(item.type, req.user._id);
            qn.uploadFile(item.path, filename, function (err) {
                if (err) return next(err);
                User.update({_id: req.user._id}, {imgUrl: filename}, err=>err ? next(err) : res.send());
            });
        } else {
            res.status(400).json(error(40001, 'upload file is required.'));
        }
    }
};
