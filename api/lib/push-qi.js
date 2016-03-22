'use strict';

const GeTui = require('./igetui/GT.push.js'),
    Target = require('./igetui/getui/Target'),
    APNTemplate = require('./igetui/getui/template/APNTemplate'),
    BaseTemplate = require('./igetui/getui/template/BaseTemplate'),
    APNPayload = require('./igetui/payload/APNPayload'),
    DictionaryAlertMsg = require('./igetui/payload/DictionaryAlertMsg'),
    SimpleAlertMsg = require('./igetui/payload/SimpleAlertMsg'),
    NotyPopLoadTemplate = require('./igetui/getui/template/NotyPopLoadTemplate'),
    LinkTemplate = require('./igetui/getui/template/LinkTemplate'),
    NotificationTemplate = require('./igetui/getui/template/NotificationTemplate'),
    PopupTransmissionTemplate = require('./igetui/getui/template/PopupTransmissionTemplate'),
    TransmissionTemplate = require('./igetui/getui/template/TransmissionTemplate'),
    SingleMessage = require('./igetui/getui/message/SingleMessage'),
    AppMessage = require('./igetui/getui/message/AppMessage'),
    ListMessage = require('./igetui/getui/message/ListMessage'),
    geTui = require('../config/config').getui;

const gt = new GeTui(geTui.host, geTui.appKey, geTui.masterSecret);

((module) => {

    // type:0-首页，1-订单详情页，2-活动方详情页;cId,clientId,3-商城订单详情
    module.pushMsg = function (type, msg, data, cId, isIOS, cb) {

        //个推信息体
        var message = new SingleMessage({
            isOffline: true,                        //是否离线
            offlineExpireTime: 3600 * 12 * 1000,    //离线时间
            data: getTemplate({type, data, msg}, isIOS)       //设置推送消息类型
        });

        //接收方
        var target = new Target({
            appId: geTui.appId,
            clientId: cId
        });

        gt.pushMessageToSingle(message, target, function (err, res) {
            if (err != null && err.exception != null && err.exception instanceof RequestError) {
                var requestId = err.exception.requestId;
                console.log(err.exception.requestId);
                gt.pushMessageToSingle(message, target, requestId, function (err, res) {
                    cb(err, res);
                });
            } else {
                cb(err, res);
            }
        });
    };

    module.pushMsg2App = function (type, msg, data, cb) {

        let taskGroupName = null;
        // android push
        var message = new AppMessage({
            isOffline: false,
            offlineExpireTime: 3600 * 12 * 1000,
            data: getTemplate({type, data, msg}),
            appIdList: [geTui.appId],
            phoneTypeList: ['ANDROID']
        });

        gt.pushMessageToApp(message, taskGroupName, (err, res)=> {
            if (err) return cb(err, res);
            message.phoneTypeList = ['IOS'];
            message.data = getTemplate({type, data, msg}, true);
            gt.pushMessageToApp(message, taskGroupName, (err, res)=> {
                cb(err, res);
            });
        });
    };

})(exports);

function getAnpsTpl(cnt) {
    var template = new NotificationTemplate({
        appId: geTui.appId,
        appKey: geTui.appKey,
        title: '个推',
        text: '个推最新版点击下载',
        logo: 'http://wwww.igetui.com/logo.png',
        isRing: true,
        isVibrate: true,
        isClearable: false,
        transmissionType: 2,
        transmissionContent: '测试离线'
    });
    let payload = new APNPayload();
    let alertMsg = new SimpleAlertMsg();
    alertMsg.alertMsg = cnt.msg;
    delete cnt.msg;
    payload.alertMsg = alertMsg;
    payload.badge = 1;
    payload.contentAvailable = 1;
    payload.customMsg.payload = JSON.stringify(cnt);
    template.setApnInfo(payload);
    return template;
}

function getTemplate(cnt, isIOS) {
    let template;
    if (isIOS) {
        //APN简单推送
        template = new APNTemplate();
        let payload = new APNPayload();
        let alertMsg = new SimpleAlertMsg();
        alertMsg.alertMsg = cnt.msg;
        delete cnt.msg;
        payload.alertMsg = alertMsg;
        payload.badge = 1;
        payload.contentAvailable = 1;
        payload.customMsg.payload = JSON.stringify(cnt);
        template.setApnInfo(payload);
    } else {
        template = new TransmissionTemplate({
            appId: geTui.appId,
            appKey: geTui.appKey,
            transmissionType: 1,
            transmissionContent: JSON.stringify(cnt)
        });
    }
    return template;
}