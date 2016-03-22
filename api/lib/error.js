'use strict';

function Error(code, message, data) {
    var err = {code: code, message: message};
    if (data) err.data = data;
    return err;
}

module.exports = Error;
