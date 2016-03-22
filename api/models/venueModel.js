'use strict';

var mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment'),
    Schema = mongoose.Schema,
    Space = require('./spaceModel');

var venueModel = function () {

    var venueSchema = new Schema({
        name: String, // 场馆名
        contactName: String, //联系人
        mobile: String, // 负责人手机号
        telephone: String,
        address: {province: String, city: String, area: String, street: String}, // 场馆地址，省/市/区/街道
        loc: {type: [Number], index: '2dsphere', sparse: true}, // 经纬度
        props: {type: Array, prop: Number}, //场馆属性:{1:灯光,2:储物,3:停车,4:更衣室,5:设备销售,6:设备租赁,7:设备维修,8:有无wifi}
        imgUrls: {type: Array, url: String},
        beginTime: String, //  工作日营业时间
        endTime: String,
        weekBeginTime: String, //  节假日营业时间
        weekEndTime: String,
        lightChargeFlg: Number, //开灯收费
        trafficRoute: String, // 交通路线
        flags: {type: Array, flag: String},// 场馆标签
        scheduleFlg: Number, // 是否接受预定
        refundFlg: Number,   // 是否接受退款
        introduce: String,  // 场馆介绍
        comments: [{
            _id: false,
            _userId: {type: Number, ref: 'User'},
            env: Number,
            serve: Number,
            comm: String,
            time: Number
        }],  // 评论
        placeCount: {type: Number, default: 0}, // 场地数
        envAvg: {type: Number, default: 5}, // 环境平均评分
        serveAvg: {type: Number, default: 5}, // 服务平均评分
        priceMin: {type: Number, default: 0},  // 最低价
        priceMax: {type: Number, default: 0},  // 最高价
        weekPriceMin: {type: Number, default: 0},  // 节假日最低价
        weekPriceMax: {type: Number, default: 0},  // 节假日最高价
        createTime: Number,
        deleteFlg: Number  // 启用状态，{0:启用，1:未启用}
    }, {versionKey: false, _id: false});

    venueSchema.plugin(autoIncrement.plugin, 'Venue');

    venueSchema.statics.changePrice = function (_id, cb) {
        let _this = this;
        Space.find({_venueId: _id}, 'price', {sort: {price: 1}, limit: 1}, function (err, pis) {
            if (err) return cb(err);
            Space.find({_venueId: _id}, 'weekPrice', {sort: {weekPrice: 1}, limit: 1}, function (err, wis) {
                if (err) return cb(err);
                _this.update({_id: _id}, {
                    priceMin: pis[0].price,
                    weekPriceMin: wis[0].weekPrice
                }, function (err) {
                    cb(err);
                });
            });
        });
    };

    return mongoose.model('Venue', venueSchema);
};

module.exports = new venueModel();
