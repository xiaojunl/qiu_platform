/**
 * 约战
 * Created by jungle on 15-10-15.
 */
'use strict';

const Arrange = require('../models/arrangeModel'),
    near = require('../config/config').near,
    Order = require('../models/orderModel'),
    _ = require('underscore')._,
    m = require('moment');

module.exports = {

    post(req, res, next) {
        let body = req.body;
        let arrange = new Arrange(body);
        arrange.arrTime = {_id: body.spaceId, name: body.name, date: body.date, time: body.time};
        arrange._userId = req.user._id;
        arrange.createTime = Date.now();
        Order.findOne({
            _id: arrange._orderId,
            type: {$lt: 3}
        }, '_venueId _clubId type').populate('_venueId _clubId', 'name address').exec((err, o) => {
            if (err) return next(err);
            let po = o.type === 1 ? o._venueId : o._clubId;
            arrange.address = po.address;
            arrange.arrName = po.name;
            arrange.save(err=>err ? next(err) : res.send());
        });
    },
    get(req, res, next){

        let q = req.query, con = {
            'address.city': q.city,
            status: 1
        }, sort = {sort: {_id: -1}};

        if (req.user) {
            con['arrUser._id'] = {$nin: [req.user._id]};
        }
        if (q.area) {
            con['address.area'] = q.area;
        }
        if (q.price || q.price == 0) {
            if (q.price) {
                sort = {sort: {money: 1}};
            } else {
                con.money = 0;
            }
        }
        if (!q.aId && q.aId != 0) {
            sort.skip = 0, sort.limit = near.limit;
        }

        Arrange.find(con, 'title _userId arrTime money arrName status', sort).populate('_userId', 'imgUrl').exec((err, as) => {
            if (q.aId || q.aId == 0) {
                let i = 0;
                for (; i < as.length; i++) {
                    if (as[i]._id == q.aId) {
                        break;
                    }
                }
                as = as.slice(i + 1, i + 1 + near.limit);
            }
            _.each(as, a=> {
                a._doc.overDays = durationDays(m().format('YYYY-MM-DD'), a.arrTime.date);
            });
            res.json({data: as, more: as.length === near.limit});
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