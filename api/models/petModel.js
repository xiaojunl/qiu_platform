'use strict';

var mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment'),
    Schema = mongoose.Schema;

var petModel = function () {

    var petSchema = new Schema({
        name: String,
        createTime: Number,
        deleteFlg: {type: Number, default: 0}
    });

    petSchema.plugin(autoIncrement.plugin, 'Pet');

    return mongoose.model('Pet', petSchema);
};

module.exports = new petModel();
