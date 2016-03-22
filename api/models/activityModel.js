'use strict';

var mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

var activityModel = function () {

    var activitySchema = new Schema({
        name: String,
        beginDate: String, // 开始日期
        endDate: String, // 结束日期
        rebate: Number, // 折扣
        imgUrl: String,
        products: [
            {type: Number, ref: 'Product'}
        ],
        basePrice: Number, // 商品最低价
        createTime: Number,
        count: {type: Number, default: 0} // 参与人数
    });

    activitySchema.plugin(autoIncrement.plugin, 'Activity');
    activitySchema.plugin(mongoosePaginate);

    return mongoose.model('Activity', activitySchema);
};

module.exports = new activityModel();
