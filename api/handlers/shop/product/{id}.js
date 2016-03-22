/**
 * Created by jungle on 15-10-18.
 */
'use strict';

const product = require('../../../models/productModel');

module.exports = {
    get(req, res, next) {
        product.findOne({_id: req.params.id}, '-deleteFlg -inventory -createTime').populate('comments._userId', 'nick imgUrl').exec((err, p)=> err ? next(err) : res.json(p));
    }
};