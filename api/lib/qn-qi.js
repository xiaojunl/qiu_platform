/**
 * Created by jungle on 14-6-20.
 */

'use strict';

var qiniu = require('qiniu'),
    http = require('http'),
    BufferHelper = require('bufferhelper'),
    config = require('../config/config.json'),
    redisQi = require('./redis-qi');

let rk_uptoken = 'uptoken';

((module) => {
    module.uptoken = function () {
        var putPolicy = new qiniu.rs.PutPolicy(config.qiniu.bucket);
        redisQi.set(rk_uptoken, putPolicy.token());
    };

    module.uploadBuf = function (body, filename, cb) {
        var extra = new qiniu.io.PutExtra();
        redisQi.get(rk_uptoken, function (err, uptoken) {
            qiniu.io.put(uptoken, filename, body, extra, cb);
        });
    };

    module.uploadFile = function (localFile, filename, cb) {
        var extra = new qiniu.io.PutExtra();
        redisQi.get(rk_uptoken, function (err, uptoken) {
            qiniu.io.putFile(uptoken, filename, localFile, extra, cb);
        });
    };

    module.uploadHttp = function (imgUrl, filename, cb) {
        http.get(imgUrl, function (res) {
            let imgData = new BufferHelper();
            res.on('data', function (chunk) {
                imgData.concat(chunk);
            });
            res.on('end', function () {
                module.uploadBuf(imgData.toBuffer(), filename, cb);
            });
        });
    };

    module.uploadExistsFile = function (localFile, filename, cb) {
        var extra = new qiniu.io.PutExtra(),
            client = new qiniu.rs.Client();
        client.remove(config.qiniu.bucket, filename, function (err) {
            if (err) {
                cb(err);
            } else {
                redisQi.get(rk_uptoken, function (err, uptoken) {
                    qiniu.io.putFile(uptoken, filename, localFile, extra, cb);
                });
            }
        });
    };

})(exports);
