'use strict';

/* Directives */

/**
 * 自定义表单验证指令
 */
var platDirective = angular.module('platDirective', []);


//手机号码验证
var MOBILE_REGEXP =/^1[3,4,5,7,8][0-9]{9}$/;
platDirective.directive('mobileformat', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function(viewValue) {
                if (MOBILE_REGEXP.test(viewValue)) {
                    // it is valid
                    ctrl.$setValidity('mobileformat', true);
                    return viewValue;
                } else {
                    // it is invalid, return undefined (no model update)
                    ctrl.$setValidity('mobileformat', false);
                    return undefined;
                }
            });
        }
    };
});


//价格验证(只能两位小数的非负数)
var PRICE_REGEXP =/^\d+(\.\d{2})?$/;
platDirective.directive('priceformat', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function(viewValue) {
                if (PRICE_REGEXP.test(viewValue)) {
                    // it is valid
                    ctrl.$setValidity('priceformat', true);
                    return viewValue;
                } else {
                    // it is invalid, return undefined (no model update)
                    ctrl.$setValidity('priceformat', false);
                    return undefined;
                }
            });
        }
    };
});


//匹配正整数
var INTEGER_REGEXP = /^[0-9]*[1-9][0-9]*$/;
platDirective.directive('positiveinteger', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function(viewValue) {
                if (INTEGER_REGEXP.test(viewValue)) {
                    // it is valid
                    ctrl.$setValidity('positiveinteger', true);
                    return viewValue;
                } else {
                    // it is invalid, return undefined (no model update)
                    ctrl.$setValidity('positiveinteger', false);
                    return undefined;
                }
            });
        }
    };
});

