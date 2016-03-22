/**
 * Created by jungle on 14-8-8.
 */
'use strict';
var session = require('express-session'),
    RedisStore = require('connect-redis')(session),
    redisConf = require('../config/config').redis;

module.exports = function redis(settings, hasRedis) {
    if (hasRedis)
        settings.store = new RedisStore(redisConf);
    return session(settings);
};