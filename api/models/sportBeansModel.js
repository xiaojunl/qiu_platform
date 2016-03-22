'use strict';

var mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment'),
    Schema = mongoose.Schema;

var sportBeansModel = function () {

    var sportBeansSchema = new Schema({
        _userId: {type: Number, ref: 'User'},
        payment: Number, // 付款方式 2:支付宝,3:微信移动支付
        price: Number,  // 充值金额
        beans: Number, // 运动豆数
        status: [
            {_id: Number, time: Number} // _id:{0:未付款，1:已支付,2:抵用,3:退回,4:活动领取}
        ],
        _orderId: {type: Number, ref: 'Order'},
        createTime: Number
    });

    sportBeansSchema.plugin(autoIncrement.plugin, 'SportBeans');

    sportBeansSchema.statics.getBeans = function (_id, cb) {
        this.findOne({_id}, 'beans _userId', function (err, u) {
            cb(err, u);
        });
    };

    return mongoose.model('SportBeans', sportBeansSchema);
};

module.exports = new sportBeansModel();
