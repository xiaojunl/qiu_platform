'use strict';

var fs = require('fs'),
    IncomingForm = require('formidable').IncomingForm;


/**
 * Filters requests for only those that are `multipart/form-data`
 * @param fn the handler to invoke
 * @returns {Function}
 */
function filter(fn) {
    return function multipart(req, res, next) {
        var contentType = req.headers['content-type'];
        if (typeof contentType === 'string' && ~contentType.indexOf('multipart/form-data')) {
            console.log('received multipart request');
            fn.apply(null, arguments);
            return;
        }
        next();
    };
}


/**
 * simple forEach that enumerates an object's properties
 * @param obj the object to enumerate
 * @param callback the callback to invoke, with the signature `callback(value, key, obj)`
 */
function forEachValue(obj, callback) {
    Object.keys(obj).forEach(function (item) {
        callback(obj[item], item, obj);
    });
}


/**
 * Cleanup handler factory
 * @param files the list of files to clean up
 * @returns {function(this:null)}
 */
function cleanify(files) {
    return forEachValue.bind(null, files, funlink);
}


/**
 * Removes the provided file from the filesystem
 * @param file a formidable File object
 */
function funlink(file) {
    var path = file.path;
    console.log('removing '+file.name);
    if (typeof path === 'string') {
        fs.unlink(path, function (err) {
            if (err) {
                console.log('Failed to remove ' + path);
                console.log(err);
            }
        });
    }
}


module.exports = function (config) {
    config = config || {};

    return filter(function (req, res, next) {
        var form = new IncomingForm(config);
        form.parse(req, function (err, fields, files) {
            if (err) {
                next(err);
                return;
            }

            req.body = fields;
            req.files = files;
            res.once('finish', cleanify(files));
            next();
        });
    });
};