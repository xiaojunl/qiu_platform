'use strict';

var Coach = require('../../../../models/coachModel'),
    Order = require('../../../../models/orderModel'),
    utils = require('../../../../lib/utils'),
    async = require('async'),
    _ = require('underscore')._,
    moment = require('moment');

module.exports = {

    get: function (req, res, next) {
        var dateTime = req.params.date;
        var datetimeStamp = moment(dateTime, 'YYYY-MM-DD').format('YYYYMMDD');
        utils.isHoliday(datetimeStamp, function (flg) {
            async.waterfall([function (cb) {
                Coach.findOne({_id: req.params.id}, '_clubId').populate('_clubId', flg ? 'weekBeginTime weekEndTime _id' : 'beginTime endTime _id').exec(function (err, c) {
                    if (c && flg) {
                        c._doc._clubId._doc.beginTime = c._clubId.weekBeginTime;
                        c._doc._clubId._doc.endTime = c._clubId.weekEndTime;
                        delete c._doc._clubId._doc.weekBeginTime;
                        delete c._doc._clubId._doc.weekEndTime;
                    }
                    let isToday = moment().format('YYYYMMDD') === datetimeStamp;
                    c._doc._clubId._doc.startTime = isToday ? nextHours() + ':00' : c._clubId.beginTime;
                    var clubId = c._clubId._id;
                    delete c._doc._clubId._doc._id;
                    cb(err, c._clubId, clubId);
                });
            }, function (time, _clubId, cb) {
                Order.find({
                    type: 2,
                    _clubId: _clubId,
                    date: dateTime,
                    deleteFlg: 0,
                    $where: 'this.status[this.status.length-1]._id<=3'
                }, 'orderTimes', (err, os)=> {
                    let orderTimes = _.flatten(_.pluck(_.where(_.flatten(_.pluck(os, 'orderTimes'), true), {_id: req.params.id}), 'times'), true);
                    cb(err, {time, orderTimes});
                });
            }
            ], function (err, ret) {
                if (err) return next(err);
                res.json(ret);
            });
        });
    }

};

function nextHours() {
    let hours = moment().add(1, 'h').format('HH');
    return hours == '00' ? '24' : hours;
}
