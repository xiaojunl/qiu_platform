'use strict';

var mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment'),
    Schema = mongoose.Schema;

var onepageModel = function () {

    var onepageSchema = new Schema({
        type: Number, //类型，1:关于xxx，2：加入我们，3：注册协议，4：隐私说明，5：常见问题
        name: String,
        content: String,
        createTime: Number,
        modifyTime: Number
    });

    onepageSchema.plugin(autoIncrement.plugin, 'Onepage');

    return mongoose.model('Onepage', onepageSchema);
};

module.exports = new onepageModel();
