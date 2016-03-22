'use strict';

var mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

var spaceModel = function () {

    var spaceSchema = new Schema({
        _venueId: {type: Number, ref: 'Venue'},
        name: String, // 场地名称
        price: Number,  // 工作日价格
        weekPrice: Number, // 节假日价格
        manCount: {type: Number, default: 0}, // 服务总人数
        priceTotal: {type: Number, default: 0}, // 总金额
        createTime: Number,
        deleteFlg: {type: Number, default: 0} // 启用状态，{0:启用，1:未启用}
    });

    spaceSchema.plugin(autoIncrement.plugin, 'Space');
    spaceSchema.plugin(mongoosePaginate);

    spaceSchema.statics.isExists = function (_venueId, name, cb) {
        this.findOne({name: name, _venueId: _venueId}, '_id', function (err, u) {
            cb(err, u ? true : false, u ? u._id : undefined);
        });
    };

    return mongoose.model('Space', spaceSchema);
};

module.exports = new spaceModel();
