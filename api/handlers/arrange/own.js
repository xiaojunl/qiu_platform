'use strict';

var Arrange = require('../../models/arrangeModel'),
    error = require('../../lib/error'),
    async = require('async'),
    m = require('moment');

module.exports = {

    get(req, res, next) {
        Arrange.find({$or: [{_userId: req.user._id}, {'arrUser._id': {$in: [req.user._id]}}]}, '_userId arrTime title money address arrUser createTime status', {sort: {_id: -1}})
            .populate('_userId', 'imgUrl nick')
            .exec((err, as)=> {
                if (err) return next(err);
                async.map(as, (a, cb)=> {
                    a._doc.isMaster = (req.user._id === a._userId._id ? 1 : 0);
                    a._doc.count = a.arrUser.length;
                    a._doc.overDays = durationDays(m().format('YYYY-MM-DD'), a.arrTime.date);
                    delete a._doc.arrUser;
                    cb(null, a);
                }, (err, ret)=>err ? next(err) : res.json(ret));
            });
    }
};

// beforeDate format:2015-10-18
function durationDays(beforeDate, afterDate) {
    var startDate = new Date(beforeDate);
    var endDate = new Date(afterDate);
    var df = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    return Math.floor(df) + 1;
}