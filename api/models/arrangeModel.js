'use strict';

var mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

var arrangeModel = function () {

    var arrangeSchema = new Schema({
        _userId: {type: Number, ref: 'User'},
        title: String,
        num: Number, // 人数
        money: Number, // 人均价格
        _orderId: {type: Number, ref: 'Order'},
        arrTime: {_id: Number, name: String, time: String, date: String}, // 预约时间
        arrName: String, // 场馆或俱乐部名
        arrUser: [{_id: {type: Number, ref: 'User'}, time: Number}],  // 报名者
        address: {province: String, city: String, area: String, street: String}, // 场馆地址，省/市/区/街道
        status: {type: Number, default: 1},  // 状态：0：取消约战,1：报名中，2：已结束
        createTime: Number
    });

    arrangeSchema.plugin(autoIncrement.plugin, 'Arrange');
    arrangeSchema.plugin(mongoosePaginate);

    return mongoose.model('Arrange', arrangeSchema);
};

module.exports = new arrangeModel();
