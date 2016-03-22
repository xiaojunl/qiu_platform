'use strict';

const Msg = require('../models/msgModel'),
    User = require('../models/userModel'),
    paginate = require('../lib/paginate'),
    sms = require('../lib/smsApi'),
    qiPush = require('../lib/push-qi'),
    _ = require('underscore')._;

module.exports = {

    post(req, res, next) {
        let msg = new Msg(req.body);
        msg.createTime = Date.now();
        msg.save(err=> {
            if (err) return next(err);

            switch (msg.type) { //1:短信，2：消息推送，3：站内消息
                case 1:
                    if (msg.to === 1) {
                        User.find({type: 1, deleteFlg: 0, mobile: {$exists: true}}, 'mobile', (err, us)=> {
                            if (err) return next(err);
                            _.each(us, function (u) {
                                sms.msg(u.mobile, msg.content);
                            });
                            res.send();
                        });
                    }
                    break;
                case 2:
                    // push message
                    qiPush.pushMsg2App(0, msg.content, undefined, (err)=> {
                        if (err) return next(err);
                        res.send();
                    });
                    break;
                case 3:
                    res.send();
                    break;
                default:
                    res.sendStatus(406);
                    break;
            }
        });
    },
    get(req, res, next){
        let q = req.query;
        Msg.paginate({}, {
            columns: '-_id',
            page: q.page,
            limit: q.limit,
            sortBy: {_id: -1},
            lean: true
        }, function (err, results, pageCount, itemCount) {
            if (err) return next(err);
            res.json(paginate(results, pageCount, itemCount));
        });
    }

};
