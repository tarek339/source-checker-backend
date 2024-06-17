"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setIO = exports.io = exports.setSocket = exports.socket = void 0;
exports.socket = null;
const setSocket = (newSocket) => {
    exports.socket = newSocket;
};
exports.setSocket = setSocket;
exports.io = null;
const setIO = (newIO) => {
    exports.io = newIO;
};
exports.setIO = setIO;
