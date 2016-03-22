'use strict';

var mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment'),
    Schema = mongoose.Schema;

var msgStateModel = function () {

    var msgStateSchema = new Schema({
        _msgId: {type: Number, ref: 'Msg'},
        _userId: {type: Number, ref: 'User'},
        createTime: Number
    });

    msgStateSchema.plugin(autoIncrement.plugin, 'MsgState');

    return mongoose.model('MsgState', msgStateSchema);
};

module.exports = new msgStateModel();
