'use strict';

var User = require('../../../../models/userModel'),
    bcrypt = require('bcryptjs');

module.exports = {

    get(req, res, next) {
        User.update({
            _id: req.params.id,
            type: {$gt: 1}
        }, {password: bcrypt.hashSync(req.params.newPass, 8)}, (err, d)=>err ? next(err) : res.sendStatus(d.n ? 200 : 404));
    }
};
