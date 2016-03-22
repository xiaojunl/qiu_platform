'use strict';

var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    autoIncrement = require('mongoose-auto-increment'),
    Schema = mongoose.Schema,
    SportBeans = require('./sportBeansModel'),
    bcrypt = require('bcryptjs');

var userModel = function () {

    var userSchema = new Schema({
        username: String,
        password: String,
        mobile: Number,
        type: Number,   // 用户类型，1:用户，2：场馆，3：俱乐部，4：平台
        _venueId: {type: Number, ref: 'Venue'},
        _clubId: {type: Number, ref: 'Club'},
        location: {
            loc: {type: [Number], index: '2dsphere', sparse: true},
            city: String
        },
        nick: String,
        signature:String, // 签名
        openId: String, // 微信openId
        imgUrl: String, // 头像
        sex: Number,  // 性别：{1:男，2:女,0:未知}
        createTime: Number,
        sportBeans: {type: Number, default: 0}, // 运动豆
        deleteFlg: {type: Number, default: 0},
        iPush: {
            clientId: String,  // for push
            devId: String,
            ua: String,
            time: Number
        }
    }, {versionKey: false});

    userSchema.plugin(autoIncrement.plugin, 'User');
    userSchema.plugin(mongoosePaginate);

    userSchema.pre('save', function (next) {
        if (this.password) {
            this.password = bcrypt.hashSync(this.password, 8);
        }
        next();
    });

    userSchema.statics.hasMobile = function (_id, cb) {
        this.findOne({_id}, 'mobile', function (err, u) {
            cb(err, u && u.mobile);
        });
    };

    userSchema.methods.passwordMatches = function (plainText) {
        var user = this;
        return bcrypt.compareSync(plainText, user.password);
    };

    userSchema.statics.findIdByClubId = function (_clubId, cb) {
        this.findOne({_clubId}, '_id', function (err, u) {
            cb(err, u ? u._id : undefined);
        });
    };

    userSchema.statics.findIdByVenueId = function (_venueId, cb) {
        this.findOne({_venueId}, '_id', function (err, u) {
            cb(err, u ? u._id : undefined);
        });
    };

    userSchema.statics.isExists = function (username, cb) {
        this.findOne({username}, '_id', function (err, u) {
            cb(err, u ? true : false, u ? u._id : undefined);
        });
    };

    userSchema.statics.getLoginUser = function (_id, cb) {
        this.findOne({_id}, 'type _venueId _clubId openId', function (err, user) {
            cb(err, user);
        });
    };

    userSchema.statics.pushInfo = function (_id, cb) {
        this.findOne({_id}, 'iPush', function (err, u) {
            cb(err, u && u.iPush);
        });
    };

    userSchema.statics.deduction = function (_id, beans, payment, _orderId, cb) {
        this.update({_id}, {$inc: {sportBeans: -beans}}, err=> {
            if (err) return cb(err);
            let sb = new SportBeans({
                _userId: _id,
                payment,
                beans,
                _orderId
            });
            sb.status = [{_id: 2, time: (sb.createTime = Date.now())}];
            sb.save(cb);
        });
    };

    userSchema.statics.reBack = function (_id, beans, payment, _orderId, cb) {
        this.update({_id}, {$inc: {sportBeans: beans}}, err=> {
            if (err) return cb(err);
            let sb = new SportBeans({
                _userId: _id,
                payment,
                beans,
                _orderId
            });
            sb.status = [{_id: 3, time: (sb.createTime = Date.now())}];
            sb.save(cb);
        });
    };

    return mongoose.model('User', userSchema);
};

module.exports = new userModel();
