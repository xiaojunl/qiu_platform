'use strict';

const Banner = require('../../models/bannerModel'),
    _ = require('underscore')._;

module.exports = {

    get(req, res, next) {
        Banner.find({deleteFlg: 0}, 'imgUrl type name content', {sort: {sort: -1}}, function (err, bs) {
            if (err) return next(err);
            _.each(bs, a=> {
                if (a.type === 2) delete a._doc.content;
            });
            res.json(bs);
        });
    }

};
