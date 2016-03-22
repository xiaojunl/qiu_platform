'use strict';

var mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment'),
    Schema = mongoose.Schema,
    Coach = require('./coachModel');

var clubModel = function () {

    var clubSchema = new Schema({
        name: String, // 俱乐部名称
        contactName: String, //联系人
        mobile: String, // 负责人手机号
        telephone: String,
        address: {province: String, city: String, area: String, street: String}, // 场馆地址，省/市/区/街道
        loc: {type: [Number], index: '2dsphere', sparse: true}, // 经纬度
        imgUrls: {type: Array, url: String},
        beginTime: String, //  工作日营业时间
        endTime: String,
        weekBeginTime: String, //  节假日营业时间
        weekEndTime: String,
        trafficRoute: String, // 交通路线
        flags: {type: Array, flag: String},// 标签
        scheduleFlg: Number, // 是否接受预定,{0:不接受，1：接受}
        refundFlg: Number,   // 是否接受退款,{0:不接受，1：接受}
        introduce: String,  // 介绍
        coachCount: {type: Number, default: 0}, // 教练数
        priceMin: {type: Number, default: 0},  // 最低价
        priceMax: {type: Number, default: 0},  // 最高价
        createTime: Number,
        deleteFlg: Number  // 启用状态，{0:启用，1:未启用}
    }, {versionKey: false, _id: false});

    clubSchema.plugin(autoIncrement.plugin, 'Club');

    clubSchema.statics.changePrice = function (_id, cb) {
        let _this = this;
        Coach.findOne({_clubId: _id}, 'price', {sort: {price: 1}}, function (err, pis) {
            if (err) return cb(err);
            _this.update({_id: _id}, {
                priceMin: pis.price
            }, function (err) {
                cb(err);
            });
        });
    };

    return mongoose.model('Club', clubSchema);
};

module.exports = new clubModel();
