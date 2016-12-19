/**
 * Created by liusheng on 16/12/6.
 */
'use strict';
const
    UserModel = require('../../../models/HUserModel'),
    Response = require('../../../utils/responseObj'),
    logger = require('../../../utils/logger.js').getLogger('admin');


exports.checkusername = async (req, res, next) => {
    let responseObj = Response();
    let _id = req.body._id;
    let username = req.body.username;
    if (!username) {
        res.json({success: false, message: 'username is empty'});
        return;
    }
    let opts = {username: username};
    if (_id) {
        opts._id = {$ne: _id};
    }
    try {
        let user = await UserModel.findOne(opts);
        if (user) {
            responseObj.errMsg(false, '名称已被使用');
            res.send(responseObj);
        } else {
            next();
        }
    } catch (err) {
        responseObj.errMsg(false, '服务器异常,请稍后再试.');
        logger.error("checkusername Error : " + err.message);
        res.send(responseObj);
    }
};

exports.checkEmail = async (req, res, next)=> {
    let responseObj = Response();
    let email = req.body.email;
    if (!email) {
        res.json({"result": "OK"});
        return;
    }
    let opts = {email: email};
    if (req.body._id) {
         opts = {_id: {$ne: req.body._id}, email: email};
    }
    try {
        let user = await UserModel.findOne(opts);
        if (user) {
            responseObj.errMsg(false, '邮箱已被使用');
            res.send(responseObj);
        } else {
            next();
        }
    } catch (err) {
        responseObj.errMsg(false, '服务器异常,请稍后再试.');
        logger.error("checkEmail Error : " + err.message);
        res.send(responseObj);
    }
};

