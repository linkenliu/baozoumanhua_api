'use strict';
const log4js = require('log4js');
log4js.configure({
    appenders: [
        {   type: 'console',
            category: 'console'}, //控制台输出
        {
            type: 'file', //文件输出
            filename: './logs/access.log',
            maxLogSize: 1024000,
            backups:3,
            category: 'access'
        },
        {
            type: 'file', //文件输出
            filename: './logs/ctrl.log',
            maxLogSize: 1024000,
            backups:3,
            category: 'ctrl'
        },
        {
            type: 'file', //文件输出
            filename: './logs/admin.log',
            maxLogSize: 1024000,
            backups:3,
            category: 'admin'
        },
        {
            type: 'file', //文件输出
            filename: './logs/chat.log',
            maxLogSize: 1024000,
            backups:3,
            category: 'chat'
        }
    ],
    replaceConsole: true
});


exports.getLogger = function(name) {
    return log4js.getLogger(name);
};

exports.LEVEL = {
    ALL: "ALL",
    TRACE:"TRACE",
    DEBUG:"DEBUG",
    INFO:"INFO",
    WARN:"WARN",
    ERROR:"ERROR",
    FATAL:"FATAL",
    MARK:"MARK",
    OFF:"OFF"
};
