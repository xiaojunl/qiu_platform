// 站内消息
'use strict';

const Msg = require('../../models/msgModel'),
    MsgState = require('../../models/msgStateModel'),
    paginate = require('../../lib/paginate'),
    async = require('async');

module.exports = {

    post(req, res, next) {
        let msgState = new MsgState({_msgId: req.body.msgId, _userId: req.user._id, createTime: Date.now()});
        msgState.save(err=>err ? next(err) : res.sendStatus(200));
    },
    get(req, res, next){
        let q = req.query;
        Msg.paginate({type: {$in: [3, 4]}, to: req.user.type}, {
            columns: 'content createTime',
            page: q.page,
            limit: q.limit,
            sortBy: {_id: -1},
            lean: true
        }, (err, results, pageCount, itemCount) => {
            if (err) return next(err);
            async.map(results, (ret, cb) => {
                MsgState.findOne({_msgId: ret._id, _userId: req.user._id}, '_id', (err, ms)=> {
                    ret._doc.state = ms ? 1 : 0;
                    cb(err, ret);
                });
            }, function (err, rets) {
                res.json(paginate(rets, pageCount, itemCount));
            });
        });
    }

};
