'use strict';
const moment = require('moment'),

    DISPLAY_DATE_FORMAT = 'YYYY-MM-DD HH:mm',

    API_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss',

    BIRTHDAY_DATE_FORMAT = 'YYYY-MM-DD',

    PUSH_DATE_FORMAT = 'YYYY-MM-DDTHH:mm',

    UTC_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS';


exports.format = (date) => {
    return moment(date).format(DISPLAY_DATE_FORMAT);
};

exports.currentDate = () => {
    return moment().format(API_DATE_FORMAT);
};


exports.formatDate = (date) => {
    return moment(date).format(API_DATE_FORMAT);
};

exports.formatBirthday = (date) => {
    return moment(date).format(BIRTHDAY_DATE_FORMAT);
};


exports.formatWeekDate = () => {
    let now = new Date(),
        nowDay = (now.getDate() + 1) - 7,
        nowMonth = now.getMonth() + 1,
        nowYear = now.getFullYear();
    if (nowMonth < 10) {
        nowMonth = "0" + nowMonth;
    }
    if (nowDay < 10) {
        nowDay = "0" + nowDay;
    }
    let date = nowYear + "-" + nowMonth + "-" + nowDay;
    return date;

};

exports.formatMonthDate = () => {
    let date = moment().subtract(30, 'days').calendar();
    let strDate = date.split('/');
    date = strDate[2] + "-" + strDate[0] + "-" + strDate[1];
    return date;
};

/**
 * 时间本地化
 * "createDate": "2015-07-22T03:29:48.000Z",
 * 格式化为"createDate": "2015-07-22 11:29",
 * @param obj sequelize对象
 * @param field 字段名
 * @returns {*}
 */
exports.localFormat = function (obj, field) {
    obj.setDataValue(field, this.format(obj.getDataValue(field)));
};

/**
 * 判断日期是否是当天，不是放回false
 * @param date
 * @returns {boolean}
 */
exports.isToday = (date) => {
    date = new Date(date);
    let currentTime = new Date();
    if (date.getYear() != currentTime.getYear()) {
        return false;
    } else if (date.getMonth() != currentTime.getMonth()) {
        return false;
    } else if (date.getDay() != currentTime.getDay()) {
        return false;
    } else {
        return true;
    }
};

/**
 * 格式化UTC时间
 * @param date
 */
exports.formatUTCTime = (date) => {
    let utcTime = moment(date, PUSH_DATE_FORMAT).utc().format(UTC_DATE_FORMAT);
    return utcTime + "Z";
};

/**
 *格式化GMT时间
 * @param {Object} date
 */
exports.formatGMTDate = function (date) {
    var dateTZ = new Date(date).toJSON();
    var datetime = moment(dateTZ).format(API_DATE_FORMAT);
    return datetime;
};


/**
 *获取每月的每周时间(周一到周日)
 * @param {Object} date
 */
exports.getweekDate = function (date) {
    let now = new Date(),
        nowDayOfWeek = now.getDay(),
        nowDay = now.getDate(),
        nowMonth = now.getMonth(),
        nowYear = now.getFullYear(),
        Hours = now.getHours(),
        Minutes = now.getMinutes(),
        Seconds = now.getSeconds();
    if (nowDayOfWeek == 0) {
        nowDayOfWeek = 7;
    } else {
        nowDayOfWeek = nowDayOfWeek;
    }
    let weekStartDate = new Date(nowYear, nowMonth, (nowDay + 1) - (nowDayOfWeek));
    let weekEndDate = new Date(nowYear, nowMonth, nowDay + (nowDayOfWeek - 6), Hours, Minutes, Seconds);
    weekStartDate = moment(weekStartDate).format(API_DATE_FORMAT);
    weekEndDate = moment(weekEndDate).format(API_DATE_FORMAT);
    return {weekStartDate: weekStartDate, weekEndDate: weekEndDate};
};

exports.getYesterdayDate = function () {
    let dd = new Date();
    dd.setDate(dd.getDate() - 1);
    let y = dd.getFullYear();
    let m = dd.getMonth() + 1;
    if (m < 10) {
        m = '0' + m;
    }
    let d = dd.getDate();
    if (d < 10) {
        d = '0' + d;
    }
    let date = y + '-' + m + '-' + d;
    return date;
};

exports.getNumberDate = function (number) {
    let dd = new Date();
    dd.setDate(dd.getDate() + (number));
    let y = dd.getFullYear();
    let m = dd.getMonth() + 1;
    if (m < 10) {
        m = '0' + m;
    }
    let d = dd.getDate();
    if (d < 10) {
        d = '0' + d;
    }
    let date = y + '-' + m + '-' + d;
    return date;
};


exports.convertDateTime = function (date) {
    let now = new Date(),
        nowDay = now.getDate(),
        nowMonth = now.getMonth(),
        nowYear = now.getFullYear(),
        Hours = now.getHours(),
        Minutes = now.getMinutes(),
        Seconds = now.getSeconds();
    if (date.indexOf('分钟前') > -1) {
        if (Minutes > date) {
            date = nowYear + "-" + (nowMonth + 1) + "-" + nowDay + " " + Hours + ":" + (Minutes - date);
            return date;
        } else {
            if ((parseInt(60) - parseInt(date) + Minutes >= 60)) {
                date = nowYear + "-" + (nowMonth + 1) + "-" + nowDay + " " + (Hours) + ":" + (parseInt(60) - parseInt(date) + Minutes - 60);
                return date;
            } else {
                date = nowYear + "-" + (nowMonth + 1) + "-" + nowDay + " " + (Hours - 1) + ":" + (parseInt(60) - parseInt(date) + Minutes);
                return date;
            }
        }
    } else if (date.indexOf('今天') > -1) {
        date = nowYear + "-" + (nowMonth + 1) + "-" + nowDay + " " + date.replace(/[^0-9|:]/ig, "");
        return date;
    } else if (date.indexOf('月' > -1)) {
        date = date.replace('月', ' ');
        date = date.replace('日', '');
        date = date.replace('时', ' ');
        date = date.replace('分', '');
        let arr = date.split(' ');
        date = nowYear + "-" + arr[0] + "-" + arr[1] + " " + arr[2] + ":" + arr[3];
        return date;
    } else {
        return date;
    }
};