'use strict';

var Product = require('../../models/productModel');

module.exports = {

    get(req, res, next) {
        Product.find({deleteFlg: 0}, 'no name brand price inventory', {sort: {_id: -1}}, (err, ps)=>err ? next(err) : res.json(ps));
    }

};
