'use strict';

var User = require('../../models/userModel'),
    Captcha = require('../../models/captchaModel'),
    SportBeans = require('../../models/sportBeansModel'),
    error = require('../../lib/error');

module.exports = {

    get(req, res, next) {
        User.findOne({_id: req.user._id}, 'sportBeans', (err, u)=>err ? next(err) : res.json(u));
    },

    post(req, res, next) {
        Captcha.check(req.body.mobile, req.body.captcha, 'bd', function (err, flg) {
            if (flg === 1) {
                User.findOne({_id: req.user._id, mobile: req.body.mobile}, 'sportBeans', (err, u)=> {
                    if (err) return next(err);
                    // TODO mobile app先注册，微网站需合并过去，用户数据也要迁移。
                    if(u) {
                        SportBeans.findOne({_userId: req.user._id, $where: `this.status[this.status.length-1]._id==4`},'_id',(err,s)=>{
                            if (err) return next(err);
                            if(s) {
                                res.status(460).json(error(46002, '已领取，不能重复领取'));
                            } else {
                                User.update({_id: req.user._id}, req.body, err=> {
                                    if (err) return next(err);
                                    let beans = new SportBeans({
                                        _userId: req.user._id,
                                        beans: req.body.sportBeans
                                    });
                                    beans.status = [{_id: 4, time: (beans.createTime = Date.now())}];
                                    beans.save(err=>err ? next(err) : res.send());
                                });
                            }
                        })
                    } else {
                        User.update({_id: req.user._id}, req.body, err=> {
                            if (err) return next(err);
                            let beans = new SportBeans({
                                _userId: req.user._id,
                                beans: req.body.sportBeans
                            });
                            beans.status = [{_id: 4, time: (beans.createTime = Date.now())}];
                            beans.save(err=>err ? next(err) : res.send());
                        });
                    }
                });
            } else if (flg === 2) {
                res.status(400).json(error(40001, '无效手机号'));
            } else if (flg === 3) {
                res.status(400).json(error(40003, '验证码过期'));
            } else if (flg === 4) {
                res.status(400).json(error(40004, '验证码错误'));
            }
        });

    }

};
