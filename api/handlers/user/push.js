'use strict';

var User = require('../../models/userModel');

module.exports = {

    post: function (req, res) {
        let body = req.body;
        let userId = req.user ? req.user._id : -1;
        body.ua = req.headers['user-agent'];
        body.time = Date.now();
        if (userId === -1) {
            console.log(`push-post: user._id not found,${JSON.stringify(body)}`);
        }
        User.update({_id: userId}, {iPush: body}, err=>err ? next(err) : res.send());
    }

};
