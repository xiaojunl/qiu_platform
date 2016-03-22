'use strict';

var Arrange = require('../../models/arrangeModel'),
    error = require('../../lib/error'),
    m = require('moment'),
    _ = require('underscore')._;

module.exports = {

    get(req, res, next) {
        let userId = req.user ? req.user._id : undefined;
        Arrange.findOne({_id: req.params.id}, '-_orderId').populate('_userId', 'imgUrl nick').populate('arrUser._id', `imgUrl nick mobile`).exec((err, a)=> {
            if (err) return next(err);
            if (a._userId._id !== userId && a.arrUser.length > 0) {
                _.each(a.arrUser, au=> {
                    delete  au._doc.mobile;
                });
            }
            let op = 0; // 0：隐藏，1：取消约战，按钮禁用，2：已结束，3：报名，4：取消报名,5:人数已满，6：显示“取消约战”
            if (a.status === 1) {
                if (a._userId._id !== userId) {
                    op = _.contains(_.pluck(_.pluck(a.arrUser, '_id'), '_id'), userId) ? 4 : (a.num > a.arrUser.length ? 3 : 5);
                } else {
                    op = a.arrUser.length > 0 ? 0 : 6;
                }
            } else {
                op = a.status ? 2 : 1;
            }
            a._doc.op = op;
            delete a._doc.status;
            res.json(a);
        });
    },
    put(req, res, next) {
        switch (req.body.type) {//type=0:取消约战,1:报名,2:取消报名
            case 0:
                Arrange.findOne({_id: req.params.id, _userId: req.user._id, status: 1}, 'arrUser', (err, a) => {
                    if (err) return next(err);
                    if (a && a.arrUser.length === 0) {
                        putArrange(a._id, -1, {status: 0}, res, next);
                    } else {
                        res.status(406).json(error(40601, '有人报名不能取消或状态已改变'));
                    }
                });
                break;
            case 1:
                Arrange.findOne({_id: req.params.id, status: 1}, 'num arrUser', (err, a) => {
                    if (err) return next(err);
                    if (a && a.arrUser.length < a.num) {
                        putArrange(a._id, req.user._id, {
                            $push: {
                                arrUser: {
                                    _id: req.user._id,
                                    time: Date.now()
                                }
                            }
                        }, res, next);
                    } else {
                        res.status(406).json(error(40602), '报名人数超过限制或状态已改变');
                    }
                });
                break;
            case 2:
                Arrange.findOne({
                    _id: req.params.id,
                    status: 1,
                    'arrUser._id': {$in: [req.user._id]}
                }, 'arrTime', (err, a) => {
                    if (err) return next(err);
                    let curDate = m(), _date = curDate.format('YYYY-MM-DD'), _time = curDate.format('HH:mm');
                    if (a && (a.arrTime.date > _date || a.arrTime.time > _time)) {
                        putArrange(a._id, req.user._id, {$pull: {arrUser: {_id: req.user._id}}}, res, next);
                    } else {
                        res.status(406).json(error(40603, '取消报名时间限制或状态已改变'));
                    }
                });
                break;
        }
    }
};

function putArrange(id, userId, setQ, res, next) {
    Arrange.update({_id: id, _userId: {$ne: userId}}, setQ, err=>err ? next(err) : res.send());
}