'use strict';

var mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

var msgModel = function () {

    var msgSchema = new Schema({
        type: Number, //类型，1:短信，2：消息推送，3：站内消息，4：订单消息
        to: Number, // 对象，1：用户,2：场馆方,3:俱乐部
        content: String,
        createTime: Number
    });

    msgSchema.plugin(autoIncrement.plugin, 'Msg');
    msgSchema.plugin(mongoosePaginate);

    return mongoose.model('Msg', msgSchema);
};

module.exports = new msgModel();
