'use strict';

var Province = require('../../config/province'),
    _ = require('underscore')._;

module.exports = {

    get: function (req, res, next) {
        var city = req.params.city;
        var cityObj = _.findWhere(_.flatten(_.pluck(Province.data, "cityList"), true), {name: city}) || {areaList: null};
        res.json(cityObj.areaList);
    }

};
