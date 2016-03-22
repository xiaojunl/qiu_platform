'use strict';

var Product = require('../../../models/productModel');

module.exports = {

    get(req, res, next) {
        Product.findOne({_id: req.params.productId}, 'comments').populate('comments._userId', '-_id nick imgUrl').exec((err, p)=>err ? next(err) : res.json(p));
    }

};
