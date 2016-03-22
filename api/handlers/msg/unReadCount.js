// 站内消息
'use strict';

const Msg = require('../../models/msgModel'),
    MsgState = require('../../models/msgStateModel');

module.exports = {

    get(req, res, next){
        Msg.count({type: {$in: [3, 4]}, to: req.user.type}, (err, cnt)=> {
            if (err) return next(err);
            MsgState.count({_userId: req.user._id}, (err, msCnt)=> {
                if (err) return next(err);
                res.json({count: (cnt - msCnt)});
            });
        });
    }

};
