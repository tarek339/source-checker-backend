"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongooseErrorHandler = void 0;
var mongooseErrorHandler = function (error) {
    var errorMessage = null;
    if (error.errors)
        errorMessage = Object.values(error.errors)[0].message;
    return errorMessage || error.message;
};
exports.mongooseErrorHandler = mongooseErrorHandler;
