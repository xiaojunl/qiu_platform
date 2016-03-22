/**
 * 地址 Model.
 */

'use strict';

var mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment'),
    Schema = mongoose.Schema;

var addressModel = function () {

    var addressSchema = new Schema({
        _userId: {type: Number, ref: 'User'},
        name: String, // 姓名
        mobile: String,
        address: String,
        deliveryTime: Number, // 送货时间 {1:周末,2:工作日,3:不限}
        createTime: Number
    });

    addressSchema.plugin(autoIncrement.plugin, 'Address');

    return mongoose.model('Address', addressSchema);
};

module.exports = new addressModel();
