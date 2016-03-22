'use strict';

var mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

var productModel = function () {

    var productSchema = new Schema({
        name: String,
        no: String,   // 编号
        brand: String, // 品牌
        price: Number,
        imgUrls: [String],
        mulitiProps: [ // 多值属性
            {_id: false, prop: String, values: [String]}
        ],
        combProps: [ // 组合库存
            {
                props: [
                    {_id: false, prop: String, value: String}
                ], inventory: Number, status: Number
            }   // inventory-库存；status-状态（1：上架，0-下架）
        ],
        desc: String,// 描述
        createTime: Number,
        deleteFlg: {type: Number, default: 1},
        comments: [{
            _id: false,
            _userId: {type: Number, ref: 'User'},
            comm: String,
            time: Number
        }],  // 顾客评价
        inventory: Number  // 总库存
    });

    productSchema.plugin(autoIncrement.plugin, 'Product');
    productSchema.plugin(mongoosePaginate);

    productSchema.statics.isExists = function (no, name, cb) {
        this.findOne({$or: [{no}, {name}]}, '_id', function (err, u) {
            cb(err, u ? true : false, u ? u._id : undefined);
        });
    };

    return mongoose.model('Product', productSchema);
};

module.exports = new productModel();
