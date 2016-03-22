// 推荐
'use strict';

var Arrange = require('../../models/arrangeModel'),
    error = require('../../lib/error'),
    _ = require('underscore')._;

module.exports = {

    get(req, res, next) {
        // TODO 距离/预约开始时间间隔/剩余名额，比较精确处理是算三个参数均值差，大值降权后相加算综合系数分。
        //10km 5小时 2人   差别不大，可以直接将距离/时间降权后相加得系数分。用ln降权，综合系数分=2人-ln(10km)-ln(5h)=2-2.3-1.6=-1.9
        // db.arranges.aggregate([{$project:{num:1,arrCount:{$subtract:['$num',{$size:'$arrUser'}]},difTime:{$divide:[{$subtract: [ new Date(), "$_arrMillTime" ]},1000 * 60 * 60]}}},{$sort:{arrCount:-1}},{$limit:5}]);
        let userId = req.user ? req.user._id : -1;
        Arrange.find({
            status: 1,
            _userId: {$ne: userId},
            'arrUser._id': {$nin: [userId]}
        }, '_userId arrTime money address.area status arrUser num', {
            sort: {_id: -1},
            skip: 0,
            limit: 5
        }).populate('_userId', 'imgUrl nick').exec((err, as) => {
            if (err) return next(err);
            _.each(as, a=> {
                a._doc.overPlus = a.num - a.arrUser.length; // 剩余名额
                delete a._doc.num;
                delete a._doc.arrUser;
            });
            res.json(as);
        });
    }
};