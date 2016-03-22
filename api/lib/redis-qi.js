'use strict';

var redis = require("redis"),
    redisConf = require('../config/config').redis;

let client, mtvals = {}, arrVals = {};

((module) => {

    module.config = function (hasRedis) {
        if (hasRedis) {
            client = redis.createClient(redisConf.port, redisConf.host);
            client.on("error", function (err) {
                console.error(err);
            });
        } else {
            client = {
                set: function (key, val) {
                    mtvals[key] = val;
                },
                get: function (key, cb) {
                    cb(null, mtvals[key]);
                },
                rpush: function (key, val) {
                    if (!arrVals[key]) arrVals[key] = [];
                    arrVals[key].push(val);
                },
                lrange: function (key, beginIndex, endIndex, cb) {
                    cb(null, arrVals[key]);
                },
                del: function (key) {
                    delete mtvals[key];
                    delete arrVals[key];
                }
            };
        }
    };

    module.client = function () {
        return client;
    };

    module.set = function (key, val) {
        client.set(key, val);
    };

    module.setex = function (key, ttl, val) {
        client.setex(key, ttl, val);
    };

    module.get = function (key, cb) {
        client.get(key, function (err, val) {
            cb(err, val);
        });
    };

    module.rpush = function (key, val) {
        client.rpush(key, val);
    };

    module.getAll = function (key, cb) {
        client.lrange(key, 0, -1, function (err, vals) {
            cb(err, vals);
        });
    };

    module.del = function (key) {
        client.del(key);
    };

    module.quit = function () {
        client.quit();
    };

    module.genKey = function (prefix, key) {
        return prefix + key;
    }
})(exports);