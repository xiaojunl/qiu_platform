'use strict';

var http = require('http');
var express = require('express');
var schedule = require('./lib/schedule');

var app = express();

var server = http.createServer(app);

server.listen('production' == app.get('env') ? 3002 : 3001, function () {
    schedule.init(app.get('env'));
    schedule.execute();
    console.log(`listening:${server.address().port},starting now! at time:${new Date()}`);
});
