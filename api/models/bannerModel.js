'use strict';

var mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment'),
    Schema = mongoose.Schema;

var bannerModel = function () {

    var bannerSchema = new Schema({
        name: String,
        imgUrl: String,
        content: String,  // type=1，新闻ID；type=2，html代码；type=4，url；type其他，不需要传值
        type: Number, //类型，1:跳转后端指定的新闻操作页，2：html网页，3：无跳转，4：打开一个指定的URL
        deleteFlg: Number,  // 启用状态，{0:启用，1:未启用}
        sort: Number, // 排序字段
        createTime: Number,
        modifyTime: Number
    });

    bannerSchema.plugin(autoIncrement.plugin, 'Banner');

    return mongoose.model('Banner', bannerSchema);
};

module.exports = new bannerModel();
