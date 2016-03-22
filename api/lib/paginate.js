'use strict';

function paginate(results, pageCount, itemCount) {
    return {data: results, paging: {pageCount: pageCount, itemCount: itemCount}};
}

module.exports = paginate;
