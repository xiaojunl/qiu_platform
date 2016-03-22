'use strict';

var Venue = require('../../../models/venueModel'),
    Space = require('../../../models/spaceModel'),
    Order = require('../../../models/orderModel'),
    utils = require('../../../lib/utils'),
    async = require('async'),
    _ = require('underscore')._,
    moment = require('moment');

module.exports = {

    get(req, res, next) {
        var dateTime = req.params.date;
        var datetimeStamp = moment(dateTime, 'YYYY-MM-DD').format('YYYYMMDD');
        utils.isHoliday(datetimeStamp, flg=> {
            let orderCount = 0;
            let isToday = moment().format('YYYYMMDD') === datetimeStamp;
            async.parallel({
                time(cb) {
                    Venue.findOne({_id: req.params.id}, flg ? 'weekBeginTime weekEndTime -_id' : 'beginTime endTime -_id', (err, v) => {
                        if (v && flg) {
                            v._doc.beginTime = v.weekBeginTime;
                            v._doc.endTime = v.weekEndTime;
                            delete v._doc.weekBeginTime;
                            delete v._doc.weekEndTime;
                        }
                        v._doc.startTime = isToday ? nextHours() + ':00' : v.beginTime;
                        cb(err, v);
                    });
                },

                prices (cb) {
                    Space.find({
                        _venueId: req.params.id,
                        deleteFlg: 0
                    }, `name ${flg ? 'weekPrice' : 'price'}`, (err, ss) => {
                        if (ss.length > 0 && flg) {
                            _.each(ss, function (s) {
                                s._doc.price = s.weekPrice;
                                delete s._doc.weekPrice;
                            });
                        }
                        cb(err, ss);
                    });
                },
                orderTimes (cb) {
                    Order.find({
                        type: 1,
                        _venueId: req.params.id,
                        date: dateTime,
                        deleteFlg: 0,
                        $where: 'this.status[this.status.length-1]._id<=3'
                    }, 'orderTimes', (err, os)=> {
                        cb(err, _.reduce(_.flatten(_.pluck(os, 'orderTimes'), true), function (momo, orderTime) {
                            let ot = _.findWhere(momo, {_id: orderTime._id});
                            orderCount += orderTime.times.length;
                            if (ot) {
                                ot.times = ot.times.concat(orderTime.times);
                            } else {
                                momo.push(orderTime);
                            }
                            return momo;
                        }, []));
                    });
                }
            }, (err, ret) => {
                if (err) return next(err);
                let ableCount = utils.durationHours(ret.time._doc.startTime, ret.time._doc.endTime) * ret.prices.length - orderCount;
                ret.ableCount = ableCount > 0 ? ableCount : 0;
                res.json(ret);
            });
        });
    }

};

function nextHours() {
    let hours = moment().add(1, 'h').format('HH');
    return hours == '00' ? '24' : hours;
}

