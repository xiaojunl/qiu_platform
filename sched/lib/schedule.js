/**
 * 计划任务
 * Created by jungle on 14-6-2.
 */
'use strict';

var http = require('http'),
    later = require('later'),
    conf = require('../config/config');

later.date.localTime();
let isProduct;
module.exports = {
    init(env){
        isProduct = env === 'production';
    },
    execute() {
        later.setInterval(min5Time, later.parse.text('every 5 min'));
        later.setInterval(min10Time, later.parse.text('every 10 min'));
        later.setInterval(tokenTime, later.parse.text('every 50 min'));
        later.setInterval(holidayTime, later.parse.text('at 0:00 am'));
        later.setInterval(refundOriginalTime, later.parse.text('at 8:10 am'));
        min5Time();
        min10Time();
        tokenTime();
        holidayTime();
        refundOriginalTime();
    }
};

function min10Time() {
    refundBalanceTime();
    orderCloseTime();
    orderClose3Time();
    confirmOrderTime();
}

function min5Time() {
    orderTime();
    orderTimeoutTime();
    acceptOrderTime();
    acceptOrderTimeoutTime();
    arrangeEndTime();
}

function confirmOrderTime() {
    doExecute('confirmOrderTime');
}
function acceptOrderTime() {
    doExecute('acceptOrderTime');
}
function acceptOrderTimeoutTime() {
    doExecute('acceptOrderTimeoutTime');
}
function refundBalanceTime() {
    doExecute('refundBalanceTime');
}
function refundOriginalTime() {
    doExecute('refundOriginalTime');
}
function tokenTime() {
    doExecute('tokenTime');
}
function holidayTime() {
    doExecute('holidayTime');
}
function orderTime() {
    doExecute('orderTime');
}
function orderTimeoutTime() {
    doExecute('orderTimeoutTime');
}
function orderCloseTime() {
    doExecute('orderCloseTime');
}
function orderClose3Time() {
    doExecute('orderClose3Time');
}
function arrangeEndTime() {
    doExecute('arrangeEndTime');
}

function doExecute(op) {
    var options = {
        host: conf.qi.host,
        path: `${conf.qi.basePath}/${op}`,
        port: isProduct ? 80 : 8000,
        headers: {'api_key': conf.apiKey}
    };
    http.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (result) {
            console.log(`sched.doExecute#time: ${new Date()};op:${op}`);
        });
    }).end();
}

