'use strict';

var mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

var coachModel = function () {
    var coachSchema = new Schema({
        _clubId: {type: Number, ref: 'Club'},
        name: String, // 姓名
        sex: Number,  // 性别：{0:男，1:女}
        level: String, // 职业等级		国家一级/二级/三级运动员
        age: Number,  // 教齡
        imgUrl: String, // 相片
        introduce: String,  // 介绍
        comments: [{
            _id: false,
            _userId: {type: Number, ref: 'User'},
            profess: Number,
            communication: Number,
            comm: String,
            time: Number
        }],  // 顾客评价 专业/沟通能力/DIY
        price: Number,  // 价格
        spacePriceFlg: Number, // 是否包含场地费 {0:不包含，1:包含}
        manCount: {type: Number, default: 0}, // 服务总人数
        priceTotal: {type: Number, default: 0}, // 总金额
        professAvg: {type: Number, default: 5}, // 专业平均评分
        communicationAvg: {type: Number, default: 5}, // 沟通平均评分
        createTime: Number,
        deleteFlg: {type: Number, default: 0} // 启用状态，{0:启用，1:未启用}
    });

    coachSchema.plugin(autoIncrement.plugin, 'Coach');
    coachSchema.plugin(mongoosePaginate);

    coachSchema.statics.isExists = function (_clubId, name, cb) {
        this.findOne({name: name, _clubId: _clubId}, '_id', function (err, u) {
            cb(err, u ? true : false, u ? u._id : undefined);
        });
    };

    return mongoose.model('Coach', coachSchema);
};

module.exports = new coachModel();
