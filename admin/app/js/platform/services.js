'use strict';

/**
 * 平台方相关service
 * Created by admin on 2015/9/13.
 */
var platformServices = angular.module('platformServices', ['ngResource']);

platformServices.factory('PlaceService',['$resource',function($resource){
    var resource = $resource("/place",{},{
        query:{method:'GET',isArray:true},
        put:{method:'PUT'}
    });
    return resource;
}]);

