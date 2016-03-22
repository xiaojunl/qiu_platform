'use strict';

var Activity = require('../../models/activityModel'),
    error = require('../../lib/error'),
    m = require('moment');

module.exports = {

    get(req, res, next) {
        Activity.findOne({_id: req.params.id}, '-createTime -count').populate('products', 'name inventory price').exec((err, a)=> err ? next(err) : res.json(a));
    }, delete(req, res, next) {
        Activity.remove({
            _id: req.params.id,
            beginDate: {$gt: m().format('YYYY-MM-DD')}
        }, (err, d)=>err ? next(err) : (d.n ? res.sendStatus(200) : res.status(406).json(error(40601, '只有未开始的活动可以删除'))));
    }
};