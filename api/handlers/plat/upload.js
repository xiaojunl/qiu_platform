'use strict';

var qn = require('../../lib/qn-qi'),
    error = require('../../lib/error'),
    utils = require('../../lib/utils');

module.exports = {

    post (req, res, next) {
        let item = req.files.file0;
        if (item && item.path) {
            var filename = utils.genFileName(item.type, req.user._id);
            qn.uploadFile(item.path, filename, function (err) {
                if (err) return next(err);
                res.json({filename: filename});
            });
        } else {
            res.status(400).json(error(40001, 'upload file is required.'));
        }
    }

};
